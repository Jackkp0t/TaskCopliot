import { describe, expect, it } from 'vitest';
import { createPiPrompt, isPiAdapterConfigured, resolvePiModelId } from '../../src/services/agent/piAdapter';

describe('Pi adapter configuration', () => {
  it('builds a provider-neutral structured-output prompt', () => {
    const prompt = createPiPrompt({ mode: 'parse_task', input: '买咖啡', now: new Date('2026-09-21T00:00:00Z') });

    expect(prompt).toContain('parse_task');
    expect(prompt).toContain('JSON');
    expect(prompt).toContain('买咖啡');
  });

  it('does not require credentials in mock mode', () => {
    const previous = process.env.AI_MODE;
    process.env.AI_MODE = 'fallback';
    expect(isPiAdapterConfigured()).toBe(false);
    if (previous === undefined) delete process.env.AI_MODE;
    else process.env.AI_MODE = previous;
  });

  it('reads the real provider configuration and normalizes the DeepSeek model alias', () => {
    const previous = {
      mode: process.env.AI_MODE,
      provider: process.env.PI_PROVIDER,
      model: process.env.PI_MODEL,
      apiKey: process.env.PI_API_KEY,
    };
    process.env.AI_MODE = 'real';
    process.env.PI_PROVIDER = 'deepseek';
    process.env.PI_MODEL = 'deepseek-flash';
    process.env.PI_API_KEY = 'test-only-key';

    expect(isPiAdapterConfigured()).toBe(true);
    expect(resolvePiModelId('deepseek', 'deepseek-flash')).toBe('deepseek-v4-flash');

    if (previous.mode === undefined) delete process.env.AI_MODE; else process.env.AI_MODE = previous.mode;
    if (previous.provider === undefined) delete process.env.PI_PROVIDER; else process.env.PI_PROVIDER = previous.provider;
    if (previous.model === undefined) delete process.env.PI_MODEL; else process.env.PI_MODEL = previous.model;
    if (previous.apiKey === undefined) delete process.env.PI_API_KEY; else process.env.PI_API_KEY = previous.apiKey;
  });
});
