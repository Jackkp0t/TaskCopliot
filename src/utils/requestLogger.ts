import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';
import { logger } from './logger';

export const requestLogger = (): RequestHandler => (request, response, next) => {
  const requestId = request.header('x-request-id') ?? randomUUID();
  const started = performance.now();
  response.setHeader('x-request-id', requestId);
  response.on('finish', () => {
    logger.info({
      requestId,
      method: request.method,
      path: request.originalUrl,
      statusCode: response.statusCode,
      durationMs: Math.round(performance.now() - started),
    }, 'request completed');
  });
  next();
};
