import type { AgentRequest, AgentResult } from '../../models/agent';

export interface AgentState {
  request: AgentRequest;
  iteration: number;
  observations: unknown[];
}

export interface ToolIntent {
  name: string;
  arguments: Record<string, unknown>;
}

export type Decision =
  | { kind: 'respond'; content: AgentResult }
  | { kind: 'call_tool'; intent: ToolIntent };

export interface ModelPort {
  decide(state: AgentState, signal: AbortSignal): Promise<Decision>;
}

export interface ToolPort {
  execute(intent: ToolIntent, signal: AbortSignal): Promise<Record<string, unknown>>;
}
