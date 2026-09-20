import type { Task } from './task';

export type AgentMode = 'parse_task' | 'decompose_task' | 'summarize';

export interface AgentRequest {
  mode: AgentMode;
  input?: string;
  task?: Task;
  tasks?: Task[];
  timezone?: string;
  now?: Date;
}

export interface TaskDraft {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  category?: string;
  due_at?: string;
}

export type AgentResult =
  | { kind: 'task_draft'; data: TaskDraft }
  | { kind: 'subtask_drafts'; data: { subtasks: TaskDraft[] } }
  | { kind: 'summary'; data: { summary: string; statistics: Record<string, number>; completedTasks: Task[]; unfinishedTasks: Task[]; highlights: Task[]; overdue: Task[] } };
