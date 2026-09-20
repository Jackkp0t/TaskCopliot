import { Router } from 'express';
import type { TaskService } from '../services/taskService';
import { createTaskController } from '../controllers/taskController';

export function createTaskRoutes(service: TaskService): Router {
  const controller = createTaskController(service);
  const router = Router();
  router.get('/', controller.list);
  router.post('/', controller.create);
  router.get('/:id', controller.get);
  router.patch('/:id', controller.update);
  router.delete('/:id', controller.remove);
  return router;
}
