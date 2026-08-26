import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('Dashboard API', () => {
  it('returns stats, recent tasks, and upcoming tasks', async () => {
    const project = await request(app).post('/api/projects').send({ name: 'Q3 Launch' });
    const projectId = project.body.data.id;

    const future = new Date(Date.now() + 86_400_000).toISOString();

    await request(app).post('/api/tasks').send({ title: 'Todo task', projectId, status: 'todo', priority: 'low' });
    await request(app).post('/api/tasks').send({ title: 'In progress task', projectId, status: 'in_progress', priority: 'medium' });
    await request(app).post('/api/tasks').send({ title: 'Done task', projectId, status: 'completed', priority: 'high' });
    await request(app).post('/api/tasks').send({ title: 'Upcoming task', projectId, status: 'todo', priority: 'high', dueDate: future });

    const res = await request(app).get('/api/dashboard/summary');

    expect(res.status).toBe(200);
    expect(res.body.data.stats).toMatchObject({
      totalProjects: 1,
      activeProjects: 1,
      totalTasks: 4,
      todoTasks: 2,
      inProgressTasks: 1,
      completedTasks: 1,
    });
    expect(res.body.data.recentTasks.length).toBeGreaterThan(0);
    expect(res.body.data.upcomingTasks).toHaveLength(1);
    expect(res.body.data.upcomingTasks[0].title).toBe('Upcoming task');
  });
});
