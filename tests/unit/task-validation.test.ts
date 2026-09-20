import { describe, expect, it } from 'vitest';
import { createTaskInputSchema, updateTaskInputSchema } from '../../src/models/task';

describe('task validation', () => {
  it('requires a non-empty title and applies task defaults', () => {
    const result = createTaskInputSchema.parse({ title: 'Buy supplies' });

    expect(result).toMatchObject({
      title: 'Buy supplies',
      status: 'pending',
      priority: 'medium',
      tags: [],
    });
  });

  it('rejects unknown enum values and blank titles', () => {
    expect(() => createTaskInputSchema.parse({ title: ' ', priority: 'urgent' })).toThrow();
  });

  it('allows partial updates but does not accept immutable fields', () => {
    const result = updateTaskInputSchema.parse({ status: 'completed', tags: ['home'] });

    expect(result).toEqual({ status: 'completed', tags: ['home'] });
  });
});
