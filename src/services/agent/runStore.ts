import type Database from 'better-sqlite3';
import type { AgentEvent } from './events';
import type { AgentMode, AgentResult } from '../../models/agent';

export interface StoredRun {
  runId: string;
  mode: AgentMode;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  result?: AgentResult;
  error?: { code: string; message: string };
  createdAt: string;
  updatedAt: string;
}

export class SqliteRunStore {
  constructor(private readonly database: Database.Database) {}

  create(runId: string, mode: AgentMode, status: StoredRun['status'] = 'running'): StoredRun {
    const now = new Date().toISOString();
    this.database.prepare('INSERT INTO agent_runs (run_id, mode, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').run(runId, mode, status, now, now);
    return { runId, mode, status, createdAt: now, updatedAt: now };
  }

  finish(runId: string, status: StoredRun['status'], result?: AgentResult, error?: StoredRun['error']): void {
    this.database.prepare('UPDATE agent_runs SET status = ?, result = ?, error = ?, updated_at = ? WHERE run_id = ?').run(status, result ? JSON.stringify(result) : null, error ? JSON.stringify(error) : null, new Date().toISOString(), runId);
  }

  append(event: AgentEvent): void {
    this.database.prepare('INSERT OR REPLACE INTO agent_events (run_id, sequence, type, payload, timestamp) VALUES (?, ?, ?, ?, ?)').run(event.runId, event.sequence, event.type, JSON.stringify(event), event.timestamp);
  }

  get(runId: string): StoredRun | undefined {
    const row = this.database.prepare('SELECT * FROM agent_runs WHERE run_id = ?').get(runId) as Record<string, unknown> | undefined;
    if (!row) return undefined;
    return {
      runId: String(row.run_id),
      mode: row.mode as AgentMode,
      status: row.status as StoredRun['status'],
      result: row.result ? JSON.parse(String(row.result)) as AgentResult : undefined,
      error: row.error ? JSON.parse(String(row.error)) as StoredRun['error'] : undefined,
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
    };
  }

  listEvents(runId: string): AgentEvent[] {
    const rows = this.database.prepare('SELECT payload FROM agent_events WHERE run_id = ? ORDER BY sequence ASC').all(runId) as Array<{ payload: string }>;
    return rows.map((row) => JSON.parse(row.payload) as AgentEvent);
  }
}
