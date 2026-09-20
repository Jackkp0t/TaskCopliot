import express, { type Express, type NextFunction, type Request, type Response } from 'express';
import path from 'node:path';
import type Database from 'better-sqlite3';
import { createDatabase } from './utils/database';
import { AppError } from './utils/errors';
import { SqliteTaskRepository } from './services/taskRepository';
import { TaskService } from './services/taskService';
import { createTaskRoutes } from './routes/taskRoutes';
import { requestLogger } from './utils/requestLogger';
import { logger } from './utils/logger';
import { AiService } from './services/aiService';
import { createAiRoutes } from './routes/aiRoutes';

export function createApp(options: { database?: Database.Database } = {}): Express {
  const app = express();
  const database = options.database ?? createDatabase(process.env.DATABASE_PATH ?? 'data/tasks.db');
  const taskService = new TaskService(new SqliteTaskRepository(database));
  const aiService = new AiService(database, taskService);

  app.use(express.json());
  app.use(requestLogger());
  app.use(express.static(path.resolve(process.cwd(), 'dist')));
  app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));
  app.use('/api/tasks', createTaskRoutes(taskService));
  app.use('/api/ai/runs', createAiRoutes(aiService));
  app.use((_request, _response, next) => next(new AppError('NOT_FOUND', 'Route not found', 404)));
  app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
    if (error instanceof AppError) return response.status(error.statusCode).json({ error: { code: error.code, message: error.message, fields: error.fields } });
    if (error instanceof Error && error.name === 'ZodError') return response.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.message } });
    logger.error({ error }, 'unhandled request error');
    return response.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  });
  return app;
}
