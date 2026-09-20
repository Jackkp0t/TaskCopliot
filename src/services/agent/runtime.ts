import { randomUUID } from 'node:crypto';
import type { AgentRequest } from '../../models/agent';
import type { AgentEvent } from './events';
import type { AgentCore } from './core';

export class AgentRuntime {
  constructor(private readonly core: AgentCore) {}

  async *run(request: AgentRequest, signal = new AbortController().signal): AsyncIterable<AgentEvent> {
    const runId = randomUUID();
    let sequence = 0;
    const startedAt = performance.now();
    const event = <T extends AgentEvent['type']>(type: T, payload: Omit<Extract<AgentEvent, { type: T }>, 'type' | 'runId' | 'sequence' | 'timestamp'>): Extract<AgentEvent, { type: T }> => ({
      type,
      runId,
      sequence: ++sequence,
      timestamp: new Date().toISOString(),
      ...payload,
    } as Extract<AgentEvent, { type: T }>);

    yield event('run_started', { request });
    try {
      signal.throwIfAborted();
      yield event('model_requested', {});
      const result = await this.core.run(request, signal);
      yield event('usage_reported', { toolCalls: 0, durationMs: Math.round(performance.now() - startedAt) });
      yield event('run_completed', { status: 'complete', result });
    } catch (error) {
      if (signal.aborted) {
        yield event('run_cancelled', {});
      } else {
        yield event('run_failed', { error: { code: 'runtime_error', message: error instanceof Error ? error.message : 'Unknown error' } });
      }
    }
  }
}
