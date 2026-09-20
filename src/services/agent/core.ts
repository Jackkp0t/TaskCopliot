import type { AgentRequest, AgentResult } from '../../models/agent';
import type { AgentState, ModelPort } from './ports';

export class AgentCore {
  constructor(private readonly model: ModelPort) {}

  async run(request: AgentRequest, signal: AbortSignal): Promise<AgentResult> {
    const state: AgentState = { request, iteration: 0, observations: [] };
    const decision = await this.model.decide(state, signal);
    if (decision.kind !== 'respond') throw new Error('Mock core does not execute tools');
    return decision.content;
  }
}
