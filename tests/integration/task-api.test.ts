import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';
import { createDatabase } from '../../src/utils/database';

describe('task api', () => {
  it('supports task CRUD over HTTP', async () => {
    const app = createApp({ database: createDatabase(':memory:') });
    const created = await request(app)
      .post('/api/tasks')
      .send({ title: 'Prepare report', priority: 'high' })
      .expect(201);

    expect(created.body.title).toBe('Prepare report');

    await request(app).get('/api/tasks').expect(200).expect(({ body }) => {
      expect(body.total).toBe(1);
    });

    await request(app)
      .patch(`/api/tasks/${created.body.id}`)
      .send({ status: 'completed' })
      .expect(200);

    await request(app).delete(`/api/tasks/${created.body.id}`).expect(204);
    await request(app).get(`/api/tasks/${created.body.id}`).expect(404);
  });

  it('returns a structured validation error', async () => {
    const app = createApp({ database: createDatabase(':memory:') });
    const response = await request(app).post('/api/tasks').send({ title: ' ' }).expect(400);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
