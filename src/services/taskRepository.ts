import type Database from 'better-sqlite3';
import type { CreateTaskInput, Task, TaskPriority, TaskStatus, UpdateTaskInput } from '../models/task';

export interface TaskListQuery {
  status?: TaskStatus;
  priority?: TaskPriority;
  tag?: string;
  category?: string;
  search?: string;
  sortBy?: 'created_at' | 'updated_at' | 'priority' | 'status' | 'due_at';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface TaskListResult {
  items: Task[];
  page: number;
  pageSize: number;
  total: number;
}

export interface TaskRepository {
  create(task: Task): Task;
  get(id: string): Task | undefined;
  list(query: TaskListQuery): TaskListResult;
  update(id: string, input: UpdateTaskInput, updatedAt: string): Task | undefined;
  delete(id: string): boolean;
}

function fromRow(row: Record<string, unknown>): Task {
  return {
    id: String(row.id),
    title: String(row.title),
    description: row.description ? String(row.description) : undefined,
    status: row.status as TaskStatus,
    priority: row.priority as TaskPriority,
    tags: JSON.parse(String(row.tags ?? '[]')) as string[],
    due_at: row.due_at ? String(row.due_at) : undefined,
    category: row.category ? String(row.category) : undefined,
    parent_id: row.parent_id ? String(row.parent_id) : undefined,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export class SqliteTaskRepository implements TaskRepository {
  constructor(private readonly database: Database.Database) {}

  create(task: Task): Task {
    this.database.prepare(`
      INSERT INTO tasks (id, title, description, status, priority, tags, due_at, category, parent_id, created_at, updated_at)
      VALUES (@id, @title, @description, @status, @priority, @tags, @due_at, @category, @parent_id, @created_at, @updated_at)
    `).run({
      ...task,
      tags: JSON.stringify(task.tags),
      description: task.description ?? null,
      due_at: task.due_at ?? null,
      category: task.category ?? null,
      parent_id: task.parent_id ?? null,
    });
    return task;
  }

  get(id: string): Task | undefined {
    const row = this.database.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    return row ? fromRow(row) : undefined;
  }

  list(query: TaskListQuery): TaskListResult {
    const conditions: string[] = [];
    const parameters: Record<string, unknown> = {};
    if (query.status) { conditions.push('status = @status'); parameters.status = query.status; }
    if (query.priority) { conditions.push('priority = @priority'); parameters.priority = query.priority; }
    if (query.category) { conditions.push('category = @category'); parameters.category = query.category; }
    if (query.tag) { conditions.push("EXISTS (SELECT 1 FROM json_each(tasks.tags) WHERE json_each.value = @tag)"); parameters.tag = query.tag; }
    if (query.search) {
      conditions.push('(title LIKE @search OR description LIKE @search)');
      parameters.search = `%${query.search}%`;
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sortColumns = { created_at: 'created_at', updated_at: 'updated_at', priority: 'priority', status: 'status', due_at: 'due_at' } as const;
    const sortBy = sortColumns[query.sortBy ?? 'created_at'];
    const sortOrder = query.sortOrder === 'asc' ? 'ASC' : 'DESC';
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 20));
    const countRow = this.database.prepare(`SELECT COUNT(*) AS count FROM tasks ${where}`).get(parameters) as { count?: number } | undefined;
    const total = Number(countRow?.count ?? 0);
    const rows = this.database.prepare(`SELECT * FROM tasks ${where} ORDER BY ${sortBy} ${sortOrder} LIMIT @limit OFFSET @offset`).all({
      ...parameters,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    }) as Record<string, unknown>[];
    return { items: rows.map(fromRow), page, pageSize, total };
  }

  update(id: string, input: UpdateTaskInput, updatedAt: string): Task | undefined {
    const current = this.get(id);
    if (!current) return undefined;
    const next: Task = { ...current, ...input, updated_at: updatedAt, tags: input.tags ?? current.tags };
    this.createReplacement(next);
    return next;
  }

  private createReplacement(task: Task): void {
    this.database.prepare(`
      UPDATE tasks SET title=@title, description=@description, status=@status, priority=@priority,
      tags=@tags, due_at=@due_at, category=@category, parent_id=@parent_id, updated_at=@updated_at WHERE id=@id
    `).run({ ...task, tags: JSON.stringify(task.tags), description: task.description ?? null, due_at: task.due_at ?? null, category: task.category ?? null, parent_id: task.parent_id ?? null });
  }

  delete(id: string): boolean {
    return this.database.prepare('DELETE FROM tasks WHERE id = ?').run(id).changes > 0;
  }
}
