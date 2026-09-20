import type { NextFunction, Request, Response } from 'express';
import type { AiService } from '../services/aiService';
import { AppError } from '../utils/errors';
import { writeSseEvent, writeSseHeaders } from '../utils/sse';

export function createAiController(service: AiService) {
  const id = (request: Request) => Array.isArray(request.params.runId) ? request.params.runId[0] : request.params.runId;
  return {
    start: async (request: Request, response: Response, next: NextFunction) => {
      try { response.status(201).json(await service.start(request.body)); } catch (error) { next(error); }
    },
    get: (request: Request, response: Response, next: NextFunction) => {
      try {
        const run = service.get(id(request));
        if (!run) throw new AppError('NOT_FOUND', `Run ${id(request)} was not found`, 404);
        response.json(run);
      } catch (error) { next(error); }
    },
    events: (request: Request, response: Response, next: NextFunction) => {
      try {
        const runId = id(request);
        if (!service.get(runId)) throw new AppError('NOT_FOUND', `Run ${runId} was not found`, 404);
        writeSseHeaders(response);
        for (const event of service.events(runId)) writeSseEvent(response, event);
        response.end();
      } catch (error) { next(error); }
    },
    cancel: (request: Request, response: Response, next: NextFunction) => {
      try {
        if (!service.cancel(id(request))) throw new AppError('NOT_FOUND', `Run ${id(request)} was not found`, 404);
        response.json({ runId: id(request), status: 'cancelled' });
      } catch (error) { next(error); }
    },
  };
}
