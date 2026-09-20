import { describe, expect, it } from 'vitest';
import { createDatabase } from '../../src/utils/database';
import { SqliteTaskRepository } from '../../src/services/taskRepository';
import { TaskService } from '../../src/services/taskService';

describe('TaskService', () => {
  it('creates, updates, lists and deletes a task', () => {
    const service = new TaskService(new SqliteTaskRepository(createDatabase(':memory:')));
    const created = service.create({ title: 'Buy supplies', tags: ['home'] });

    expect(created.title).toBe('Buy supplies');
    expect(created.status).toBe('pending');
    expect(service.list({}).total).toBe(1);

    const updated = service.update(created.id, { status: 'completed' });
    expect(updated.status).toBe('completed');
    expect(service.get(created.id)?.id).toBe(created.id);

    expect(service.delete(created.id)).toBe(true);
    expect(service.get(created.id)).toBeUndefined();
  });

  it('filters, sorts and paginates tasks', () => {
    const service = new TaskService(new SqliteTaskRepository(createDatabase(':memory:')));
    service.create({ title: 'Low task', priority: 'low', tags: ['home'] });
    service.create({ title: 'High task', priority: 'high', tags: ['work'] });

    const result = service.list({ priority: 'high', page: 1, pageSize: 1 });
    expect(result.total).toBe(1);
    expect(result.items[0].title).toBe('High task');
  });
});
