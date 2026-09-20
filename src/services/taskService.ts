import { randomUUID } from 'node:crypto';
import { createTaskInputSchema, updateTaskInputSchema, type CreateTaskInput, type Task, type UpdateTaskInput } from '../models/task';
import { notFound } from '../utils/errors';
import type { TaskListQuery, TaskListResult, TaskRepository } from './taskRepository';

export class TaskService {
  constructor(private readonly repository: TaskRepository) {}

  create(input: CreateTaskInput): Task {
    const parsed = createTaskInputSchema.parse(input);
    const now = new Date().toISOString();
    return this.repository.create({ ...parsed, id: randomUUID(), created_at: now, updated_at: now });
  }

  get(id: string): Task | undefined { return this.repository.get(id); }

  list(query: TaskListQuery): TaskListResult { return this.repository.list(query); }

  update(id: string, input: UpdateTaskInput): Task {
    const parsed = updateTaskInputSchema.parse(input);
    const updated = this.repository.update(id, parsed, new Date().toISOString());
    if (!updated) throw notFound(`Task ${id} was not found`);
    return updated;
  }

  delete(id: string): boolean {
    if (!this.repository.delete(id)) throw notFound(`Task ${id} was not found`);
    return true;
  }
}
