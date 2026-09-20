import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';
import { createDatabase } from '../../src/utils/database';

describe('mock ai api', () => {
  it('creates a task draft run and exposes replayable SSE events', async () => {
    const app = createApp({ database: createDatabase(':memory:') });
    const created = await request(app).post('/api/ai/runs').send({
      mode: 'parse_task',
      input: '提醒我明天下午3点购买日用品',
      timezone: 'Asia/Shanghai',
    }).expect(201);

    expect(created.body.runId).toBeTruthy();
    expect(created.body.status).toBe('completed');
    expect(created.body.result.kind).toBe('task_draft');

    const status = await request(app).get(`/api/ai/runs/${created.body.runId}`).expect(200);
    expect(status.body.status).toBe('completed');

    const stream = await request(app).get(`/api/ai/runs/${created.body.runId}/events`).expect(200);
    expect(stream.headers['content-type']).toContain('text/event-stream');
    expect(stream.text).toContain('run_started');
    expect(stream.text).toContain('run_completed');
  });
});
