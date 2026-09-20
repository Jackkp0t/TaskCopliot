import path from 'node:path';
import { createAgentSession, ModelRuntime, SessionManager } from '@earendil-works/pi-coding-agent';
import type { AgentRequest, AgentResult } from '../../models/agent';
import type { AgentState, Decision, ModelPort } from './ports';

export function isPiAdapterConfigured(): boolean {
  return process.env.AI_MODE === 'real'
    && Boolean(process.env.PI_PROVIDER)
    && Boolean(process.env.PI_MODEL)
    && Boolean(process.env.PI_API_KEY);
}

export function resolvePiModelId(provider: string, modelId: string): string {
  if (provider === 'deepseek' && modelId === 'deepseek-flash') return 'deepseek-v4-flash';
  return modelId;
}

function providerApiKeyEnv(provider: string): string | undefined {
  const knownProviders: Record<string, string> = {
    openai: 'OPENAI_API_KEY',
    anthropic: 'ANTHROPIC_API_KEY',
    deepseek: 'DEEPSEEK_API_KEY',
    google: 'GEMINI_API_KEY',
    openrouter: 'OPENROUTER_API_KEY',
  };
  return knownProviders[provider] ?? `${provider.replace(/[^a-z0-9]/gi, '_').toUpperCase()}_API_KEY`;
}

function configureProviderCredential(provider: string): void {
  const apiKey = process.env.PI_API_KEY;
  const envName = providerApiKeyEnv(provider);
  if (apiKey && envName && !process.env[envName]) process.env[envName] = apiKey;
}

export function createPiPrompt(request: AgentRequest): string {
  return [
    'You are a task planning assistant.',
    'Return only valid JSON. Do not use Markdown fences.',
    `Operation mode: ${request.mode}`,
    `Input: ${request.input ?? ''}`,
    `Context: ${JSON.stringify({ task: request.task, tasks: request.tasks, timezone: request.timezone })}`,
    'For parse_task return {"kind":"task_draft","data":{"title":"","description":"","priority":"low|medium|high","tags":[],"category":"","due_at":""}}.',
    'For decompose_task return {"kind":"subtask_drafts","data":{"subtasks":[]}}.',
    'For summarize, identify tasks belonging to today in the requested timezone using due_at, created_at, or updated_at. Return what the user completed and what remains unfinished. Return {"kind":"summary","data":{"summary":"今天做了：...。还没做：...。","statistics":{"todayTotal":0,"completedToday":0,"unfinishedToday":0},"completedTasks":[],"unfinishedTasks":[],"highlights":[],"overdue":[]}}.',
  ].join('\n');
}

function parseResult(text: string): AgentResult {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('Pi model did not return JSON');
  return JSON.parse(text.slice(start, end + 1)) as AgentResult;
}

export class PiModelPort implements ModelPort {
  async decide(state: AgentState, signal: AbortSignal): Promise<Decision> {
    if (!isPiAdapterConfigured()) throw new Error('Pi provider is not configured; use AI_MODE=fallback for mock runs');
    signal.throwIfAborted();
    const provider = process.env.PI_PROVIDER as string;
    const configuredModelId = process.env.PI_MODEL as string;
    const modelId = resolvePiModelId(provider, configuredModelId);
    configureProviderCredential(provider);
    const authPath = process.env.PI_AUTH_PATH ?? path.resolve(process.cwd(), 'data/pi-auth.json');
    const modelRuntime = await ModelRuntime.create({ refreshOnCreate: false, authPath });
    const model = modelRuntime.getModel(provider, modelId);
    if (!model) throw new Error(`Pi model is not available: ${provider}/${modelId}`);
    const { session } = await createAgentSession({
      modelRuntime,
      model,
      noTools: 'all',
      tools: [],
      sessionManager: SessionManager.inMemory(),
    });
    let response = '';
    const unsubscribe = session.subscribe((event) => {
      if (event.type === 'message_update' && event.assistantMessageEvent.type === 'text_delta') response += event.assistantMessageEvent.delta;
    });
    const abort = () => { void session.abort(); };
    signal.addEventListener('abort', abort, { once: true });
    try {
      await session.prompt(createPiPrompt(state.request));
      return { kind: 'respond', content: parseResult(response) };
    } finally {
      signal.removeEventListener('abort', abort);
      unsubscribe();
      session.dispose();
    }
  }
}
