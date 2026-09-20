import { z } from 'zod';

export const taskStatusSchema = z.enum(['pending', 'in_progress', 'completed']);
export const taskPrioritySchema = z.enum(['low', 'medium', 'high']);

const optionalText = z.string().trim().max(2000).optional();
const tagList = z.array(z.string().trim().min(1).max(40)).max(20).default([]);

export const createTaskInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: optionalText,
  status: taskStatusSchema.default('pending'),
  priority: taskPrioritySchema.default('medium'),
  tags: tagList,
  due_at: z.string().datetime({ offset: true }).optional(),
  category: z.string().trim().min(1).max(80).optional(),
  parent_id: z.string().trim().min(1).optional(),
});

export const updateTaskInputSchema = createTaskInputSchema.partial();

export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type TaskPriority = z.infer<typeof taskPrioritySchema>;
export type CreateTaskInput = z.input<typeof createTaskInputSchema>;
export type UpdateTaskInput = z.input<typeof updateTaskInputSchema>;

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  created_at: string;
  updated_at: string;
  tags: string[];
  due_at?: string;
  category?: string;
  parent_id?: string;
}
