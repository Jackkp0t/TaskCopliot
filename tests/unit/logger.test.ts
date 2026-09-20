import { describe, expect, it } from 'vitest';
import { redactSensitive } from '../../src/utils/logger';

describe('structured logging', () => {
  it('redacts credentials and authorization values', () => {
    const result = redactSensitive({
      requestId: 'req-1',
      authorization: 'Bearer secret',
      apiKey: 'hidden',
      nested: { password: 'secret' },
    });

    expect(result).toEqual({
      requestId: 'req-1',
      authorization: '[REDACTED]',
      apiKey: '[REDACTED]',
      nested: { password: '[REDACTED]' },
    });
  });
});
