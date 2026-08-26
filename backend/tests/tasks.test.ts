import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

const app = createApp();

async function createProject(name: string) {
  const res = await request(app).post('/api/projects').send({ name });
  return res.body.data.id as string;
}

describe('Tasks API', () => {
  let projectId: string;

  beforeEach(async () => {
    projectId = await createProject('Website Redesign');
  });

  it('creates a task', async () => {
    const res = await request(app).post('/api/tasks').send({
      title: 'Audit landing page copy',
      projectId,
      status: 'todo',
      priority: 'high',
      labels: ['copy', 'seo'],
    });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      title: 'Audit landing page copy',
      status: 'todo',
      priority: 'high',
      labels: ['copy', 'seo'],
    });
    expect(res.body.data.project).toMatchObject({ id: projectId, name: 'Website Redesign' });
  });

  it('rejects a task referencing a non-existent project', async () => {
    const res = await request(app).post('/api/tasks').send({
      title: 'Orphan task',
      projectId: '64b64b64b64b64b64b64b64b',
      status: 'todo',
      priority: 'low',
    });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('rejects a task missing required fields', async () => {
    const res = await request(app).post('/api/tasks').send({ title: 'No project' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    const fields = res.body.error.details.map((d: { field: string }) => d.field);
    expect(fields).toEqual(expect.arrayContaining(['projectId', 'status', 'priority']));
  });

  it('rejects an invalid priority value', async () => {
    const res = await request(app).post('/api/tasks').send({
      title: 'Bad priority',
      projectId,
      status: 'todo',
      priority: 'urgent',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('updates task status via the dedicated endpoint', async () => {
    const created = await request(app).post('/api/tasks').send({
      title: 'Ship it',
      projectId,
      status: 'todo',
      priority: 'medium',
    });
    const id = created.body.data.id;

    const res = await request(app).patch(`/api/tasks/${id}/status`).send({ status: 'completed' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('completed');
  });

  it('searches tasks by partial, case-insensitive title', async () => {
    await request(app).post('/api/tasks').send({ title: 'Landing Page Copy', projectId, status: 'todo', priority: 'low' });
    await request(app).post('/api/tasks').send({ title: 'Unrelated Task', projectId, status: 'todo', priority: 'low' });

    const res = await request(app).get('/api/tasks').query({ search: 'landing' });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Landing Page Copy');
  });

  it('returns an empty list, not a 404, when no task matches', async () => {
    const res = await request(app).get('/api/tasks').query({ search: 'does-not-exist' });
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.meta.total).toBe(0);
  });

  it('combines project, status, and priority filters with AND', async () => {
    const otherProjectId = await createProject('Other Project');

    await request(app).post('/api/tasks').send({ title: 'Match', projectId, status: 'in_progress', priority: 'high' });
    await request(app).post('/api/tasks').send({ title: 'Wrong status', projectId, status: 'todo', priority: 'high' });
    await request(app).post('/api/tasks').send({ title: 'Wrong project', projectId: otherProjectId, status: 'in_progress', priority: 'high' });

    const res = await request(app).get('/api/tasks').query({
      projectId,
      status: 'in_progress',
      priority: 'high',
    });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Match');
  });

  it('sorts by priority using semantic weight, not alphabetically', async () => {
    await request(app).post('/api/tasks').send({ title: 'Low', projectId, status: 'todo', priority: 'low' });
    await request(app).post('/api/tasks').send({ title: 'High', projectId, status: 'todo', priority: 'high' });
    await request(app).post('/api/tasks').send({ title: 'Medium', projectId, status: 'todo', priority: 'medium' });

    const res = await request(app).get('/api/tasks').query({ sortBy: 'priority', sortOrder: 'desc' });
    expect(res.status).toBe(200);
    expect(res.body.data.map((t: { title: string }) => t.title)).toEqual(['High', 'Medium', 'Low']);
  });

  it('sorts tasks with no due date last regardless of direction', async () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    await request(app).post('/api/tasks').send({ title: 'No due date', projectId, status: 'todo', priority: 'low' });
    await request(app).post('/api/tasks').send({ title: 'Has due date', projectId, status: 'todo', priority: 'low', dueDate: future });

    const asc = await request(app).get('/api/tasks').query({ sortBy: 'dueDate', sortOrder: 'asc' });
    expect(asc.body.data.map((t: { title: string }) => t.title)).toEqual(['Has due date', 'No due date']);

    const desc = await request(app).get('/api/tasks').query({ sortBy: 'dueDate', sortOrder: 'desc' });
    expect(desc.body.data.map((t: { title: string }) => t.title)).toEqual(['Has due date', 'No due date']);
  });

  it('deletes a task', async () => {
    const created = await request(app).post('/api/tasks').send({
      title: 'Delete me',
      projectId,
      status: 'todo',
      priority: 'low',
    });

    const del = await request(app).delete(`/api/tasks/${created.body.data.id}`);
    expect(del.status).toBe(204);

    const getAfter = await request(app).get(`/api/tasks/${created.body.data.id}`);
    expect(getAfter.status).toBe(404);
  });
});
