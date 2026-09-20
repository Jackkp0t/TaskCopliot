import type { NextFunction, Request, Response } from 'express';
import { createTaskInputSchema, taskPrioritySchema, taskStatusSchema, updateTaskInputSchema } from '../models/task';
import type { TaskService } from '../services/taskService';
import { AppError } from '../utils/errors';

export function createTaskController(service: TaskService) {
  const stringParam = (value: string | string[]) => Array.isArray(value) ? value[0] : value;
  const stringQuery = (value: unknown) => typeof value === 'string' ? value : undefined;
  return {
    create: (request: Request, response: Response, next: NextFunction) => {
      try { response.status(201).json(service.create(createTaskInputSchema.parse(request.body))); } catch (error) { next(error); }
    },
    get: (request: Request, response: Response, next: NextFunction) => {
      try {
        const id = stringParam(request.params.id);
        const task = service.get(id);
        if (!task) throw new AppError('NOT_FOUND', `Task ${id} was not found`, 404);
        response.json(task);
      } catch (error) { next(error); }
    },
    list: (request: Request, response: Response, next: NextFunction) => {
      try {
        const query = request.query;
        response.json(service.list({
          status: query.status ? taskStatusSchema.parse(query.status) : undefined,
          priority: query.priority ? taskPrioritySchema.parse(query.priority) : undefined,
          tag: stringQuery(query.tag),
          category: stringQuery(query.category),
          search: stringQuery(query.search),
          sortBy: stringQuery(query.sortBy) as 'created_at' | 'updated_at' | 'priority' | 'status' | 'due_at' | undefined,
          sortOrder: query.sortOrder === 'asc' ? 'asc' : 'desc',
          page: stringQuery(query.page) ? Number(stringQuery(query.page)) : undefined,
          pageSize: stringQuery(query.pageSize) ? Number(stringQuery(query.pageSize)) : undefined,
        }));
      } catch (error) { next(error); }
    },
    update: (request: Request, response: Response, next: NextFunction) => {
      try { response.json(service.update(stringParam(request.params.id), updateTaskInputSchema.parse(request.body))); } catch (error) { next(error); }
    },
    remove: (request: Request, response: Response, next: NextFunction) => {
      try { service.delete(stringParam(request.params.id)); response.status(204).send(); } catch (error) { next(error); }
    },
  };
}
