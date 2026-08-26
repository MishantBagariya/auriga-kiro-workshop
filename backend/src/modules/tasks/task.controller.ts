import type { Request, Response } from 'express';
import * as taskService from './task.service.js';
import type { CreateTaskInput, ListTasksQuery, UpdateTaskInput } from './task.validation.js';

export async function list(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as ListTasksQuery;
  const { tasks, meta } = await taskService.listTasks(query);
  res.status(200).json({ data: tasks, meta });
}

export async function getOne(req: Request, res: Response): Promise<void> {
  const task = await taskService.getTaskById(req.params.id as string);
  res.status(200).json({ data: task });
}

export async function create(req: Request, res: Response): Promise<void> {
  const task = await taskService.createTask(req.body as CreateTaskInput);
  res.status(201).json({ data: task });
}

export async function update(req: Request, res: Response): Promise<void> {
  const task = await taskService.updateTask(req.params.id as string, req.body as UpdateTaskInput);
  res.status(200).json({ data: task });
}

export async function updateStatus(req: Request, res: Response): Promise<void> {
  const { status } = req.body as { status: 'todo' | 'in_progress' | 'completed' };
  const task = await taskService.updateTaskStatus(req.params.id as string, status);
  res.status(200).json({ data: task });
}

export async function remove(req: Request, res: Response): Promise<void> {
  await taskService.deleteTask(req.params.id as string);
  res.status(204).send();
}
