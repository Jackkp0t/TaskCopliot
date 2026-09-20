import type { AgentResult, AgentRequest } from '../../models/agent';
import type { Decision } from './ports';

export type AgentEvent =
  | { type: 'run_started'; runId: string; sequence: number; timestamp: string; request: AgentRequest }
  | { type: 'model_requested'; runId: string; sequence: number; timestamp: string }
  | { type: 'decision_made'; runId: string; sequence: number; timestamp: string; decision: Decision }
  | { type: 'tool_started'; runId: string; sequence: number; timestamp: string; toolName: string }
  | { type: 'tool_completed'; runId: string; sequence: number; timestamp: string; toolName: string; result?: unknown; error?: string }
  | { type: 'observation_added'; runId: string; sequence: number; timestamp: string; observation: unknown }
  | { type: 'usage_reported'; runId: string; sequence: number; timestamp: string; toolCalls: number; durationMs: number }
  | { type: 'run_completed'; runId: string; sequence: number; timestamp: string; status: 'complete' | 'partial'; result: AgentResult }
  | { type: 'run_failed'; runId: string; sequence: number; timestamp: string; error: { code: string; message: string } }
  | { type: 'run_cancelled'; runId: string; sequence: number; timestamp: string };
