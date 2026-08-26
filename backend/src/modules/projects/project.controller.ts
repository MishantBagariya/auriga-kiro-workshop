import type { Request, Response } from 'express';
import * as projectService from './project.service.js';
import * as taskService from '../tasks/task.service.js';
import type { CreateProjectInput, UpdateProjectInput } from './project.validation.js';
import type { ListTasksQuery } from '../tasks/task.validation.js';

export async function list(_req: Request, res: Response): Promise<void> {
  const projects = await projectService.listProjects();
  res.status(200).json({ data: projects });
}

export async function getOne(req: Request, res: Response): Promise<void> {
  const project = await projectService.getProjectById(req.params.id as string);
  res.status(200).json({ data: project });
}

export async function create(req: Request, res: Response): Promise<void> {
  const project = await projectService.createProject(req.body as CreateProjectInput);
  res.status(201).json({ data: project });
}

export async function update(req: Request, res: Response): Promise<void> {
  const project = await projectService.updateProject(req.params.id as string, req.body as UpdateProjectInput);
  res.status(200).json({ data: project });
}

export async function remove(req: Request, res: Response): Promise<void> {
  await projectService.deleteProject(req.params.id as string);
  res.status(204).send();
}

export async function listTasks(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as ListTasksQuery;
  const { tasks, meta } = await taskService.listTasksForProject(req.params.id as string, query);
  res.status(200).json({ data: tasks, meta });
}
