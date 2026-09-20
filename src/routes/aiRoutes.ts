import { Router } from 'express';
import type { AiService } from '../services/aiService';
import { createAiController } from '../controllers/aiController';

export function createAiRoutes(service: AiService): Router {
  const controller = createAiController(service);
  const router = Router();
  router.post('/', controller.start);
  router.get('/:runId/events', controller.events);
  router.get('/:runId', controller.get);
  router.post('/:runId/cancel', controller.cancel);
  return router;
}
