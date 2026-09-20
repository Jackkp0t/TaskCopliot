import type { Response } from 'express';
import type { AgentEvent } from '../services/agent/events';

export function writeSseHeaders(response: Response): void {
  response.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
}

export function writeSseEvent(response: Response, event: AgentEvent): void {
  response.write(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
}
