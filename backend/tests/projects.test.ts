import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('Projects API', () => {
  it('creates a project with defaults', async () => {
    const res = await request(app).post('/api/projects').send({ name: 'Website Redesign' });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      name: 'Website Redesign',
      status: 'active',
      taskCount: 0,
      completedTaskCount: 0,
    });
    expect(res.body.data.id).toBeTypeOf('string');
    expect(res.body.data._id).toBeUndefined();
  });

  it('rejects a project with no name', async () => {
    const res = await request(app).post('/api/projects').send({ description: 'no name here' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'name' })]),
    );
  });

  it('rejects an unknown field (strict schema)', async () => {
    const res = await request(app)
      .post('/api/projects')
      .send({ name: 'X', taskCount: 5 });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('lists projects sorted by createdAt desc', async () => {
    await request(app).post('/api/projects').send({ name: 'First' });
    await request(app).post('/api/projects').send({ name: 'Second' });

    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].name).toBe('Second');
  });

  it('returns 404 for a well-formed but non-existent id', async () => {
    const res = await request(app).get('/api/projects/64b64b64b64b64b64b64b64b');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns INVALID_ID for a malformed id', async () => {
    const res = await request(app).get('/api/projects/not-an-id');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_ID');
  });

  it('updates a project with a partial body', async () => {
    const created = await request(app).post('/api/projects').send({ name: 'Old Name' });
    const id = created.body.data.id;

    const res = await request(app).patch(`/api/projects/${id}`).send({ status: 'archived' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Old Name');
    expect(res.body.data.status).toBe('archived');
  });

  it('deletes a project and cascades to its tasks', async () => {
    const project = await request(app).post('/api/projects').send({ name: 'Cascade Me' });
    const projectId = project.body.data.id;

    await request(app).post('/api/tasks').send({
      title: 'Task A',
      projectId,
      status: 'todo',
      priority: 'low',
    });

    const del = await request(app).delete(`/api/projects/${projectId}`);
    expect(del.status).toBe(204);

    const tasksAfter = await request(app).get('/api/tasks').query({ projectId });
    expect(tasksAfter.body.data).toHaveLength(0);
  });
});
