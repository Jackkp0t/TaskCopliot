import { describe, expect, it } from 'vitest';
import { createPiPrompt, isPiAdapterConfigured } from '../../src/services/agent/piAdapter';

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
});
