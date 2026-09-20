import type Database from 'better-sqlite3';
import { z } from 'zod';
import type { AgentMode, AgentRequest } from '../models/agent';
import type { TaskService } from './taskService';
import { AgentCore } from './agent/core';
import { FakeModelPort } from './agent/fakeAdapter';
import { AgentRuntime } from './agent/runtime';
import { SqliteRunStore } from './agent/runStore';
import { isPiAdapterConfigured, PiModelPort } from './agent/piAdapter';

export const aiRunInputSchema = z.object({
  mode: z.enum(['parse_task', 'decompose_task', 'summarize']),
  input: z.string().trim().optional(),
  taskId: z.string().trim().optional(),
  timezone: z.string().trim().default('Asia/Shanghai'),
});

export type AiRunInput = z.input<typeof aiRunInputSchema>;

export class AiService {
  private readonly store: SqliteRunStore;
  private readonly runtime: AgentRuntime;

  constructor(database: Database.Database, private readonly tasks: TaskService) {
    this.store = new SqliteRunStore(database);
    this.runtime = new AgentRuntime(new AgentCore(isPiAdapterConfigured() ? new PiModelPort() : new FakeModelPort()));
  }

  async start(input: AiRunInput): Promise<{ runId: string; status: string; result?: unknown }> {
    const parsed = aiRunInputSchema.parse(input);
    const task = parsed.taskId ? this.tasks.get(parsed.taskId) : undefined;
    const request: AgentRequest = {
      mode: parsed.mode as AgentMode,
      input: parsed.input,
      task,
      tasks: parsed.mode === 'summarize' ? this.tasks.list({ page: 1, pageSize: 100 }).items : undefined,
      timezone: parsed.timezone,
      now: new Date(),
    };
    const events = [];
    for await (const event of this.runtime.run(request)) events.push(event);
    const runId = events[0]?.runId;
    if (!runId) throw new Error('Agent runtime did not emit run_started');
    this.store.create(runId, parsed.mode, 'running');
    for (const event of events) this.store.append(event);
    const completed = events.find((event) => event.type === 'run_completed');
    const failed = events.find((event) => event.type === 'run_failed');
    if (completed?.type === 'run_completed') {
      this.store.finish(runId, 'completed', completed.result);
      return { runId, status: 'completed', result: completed.result };
    }
    if (failed?.type === 'run_failed') {
      this.store.finish(runId, 'failed', undefined, failed.error);
      return { runId, status: 'failed' };
    }
    this.store.finish(runId, 'cancelled');
    return { runId, status: 'cancelled' };
  }

  get(runId: string) { return this.store.get(runId); }

  events(runId: string) { return this.store.listEvents(runId); }

  cancel(runId: string): boolean {
    if (!this.store.get(runId)) return false;
    this.store.finish(runId, 'cancelled');
    return true;
  }
}
