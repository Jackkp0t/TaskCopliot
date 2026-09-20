import pino, { type Logger } from 'pino';

const secretKeys = new Set(['authorization', 'apikey', 'api_key', 'password', 'token', 'secret']);

export function redactSensitive(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactSensitive);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).map(([key, child]) => [
    key,
    secretKeys.has(key.toLowerCase()) ? '[REDACTED]' : redactSensitive(child),
  ]));
}

export function createLogger(): Logger {
  return pino({
    level: process.env.LOG_LEVEL ?? 'info',
    base: undefined,
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: ['req.headers.authorization', 'authorization', 'apiKey', 'api_key', 'password', 'token', 'secret'],
      censor: '[REDACTED]',
    },
  });
}

export const logger = createLogger();
