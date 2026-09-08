import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';

const VALID_STATUSES = ['Todo', 'InProgress', 'Completed'] as const;
const VALID_PRIORITIES = ['Low', 'Medium', 'High'] as const;

const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  projectId: z.string().min(1, 'Project is required'),
  status: z.enum(VALID_STATUSES, { error: 'Invalid status' }),
  priority: z.enum(VALID_PRIORITIES, { error: 'Invalid priority' }),
  dueDate: z.string().optional().nullable(),
  labels: z.array(z.string()).optional().default([]),
});

const updateTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').optional(),
  description: z.string().optional().nullable(),
  projectId: z.string().min(1, 'Project is required').optional(),
  status: z.enum(VALID_STATUSES, { error: 'Invalid status' }).optional(),
  priority: z.enum(VALID_PRIORITIES, { error: 'Invalid priority' }).optional(),
  dueDate: z.string().optional().nullable(),
  labels: z.array(z.string()).optional(),
});

const statusSchema = z.object({
  status: z.enum(VALID_STATUSES, { error: 'Invalid status' }),
});

function getZodMessage(error: z.ZodError): string {
  const issues = (error as any).issues ?? [];
  return issues.length > 0 ? issues[0].message : 'Invalid request data';
}

// POST /api/tasks
export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: getZodMessage(parsed.error) });
      return;
    }

    const project = await prisma.project.findUnique({ where: { id: parsed.data.projectId } });
    if (!project) {
      res.status(400).json({ error: 'Project not found' });
      return;
    }

    const { labels, dueDate, ...rest } = parsed.data;
    const task = await prisma.task.create({
      data: {
        ...rest,
        labels: JSON.stringify(labels),
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: { project: { select: { id: true, name: true } } },
    });

    res.status(201).json({ data: formatTask(task) });
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks
export const getAllTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, projectId, status, priority, sortBy, order } = req.query as Record<string, string>;

    const where: any = {};
    if (search) where.title = { contains: search };
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const validSortFields = ['createdAt', 'updatedAt', 'dueDate', 'priority'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = order === 'asc' ? 'asc' : 'desc';

    let tasks;
    if (sortField === 'priority') {
      // Priority is a string — sort by weight in app layer (Low=1, Medium=2, High=3)
      tasks = await prisma.task.findMany({
        where,
        include: { project: { select: { id: true, name: true } } },
      });
      const priorityOrder: Record<string, number> = { Low: 1, Medium: 2, High: 3 };
      tasks = tasks.sort((a, b) => {
        const diff = (priorityOrder[a.priority] ?? 0) - (priorityOrder[b.priority] ?? 0);
        return sortOrder === 'asc' ? diff : -diff;
      });
    } else {
      tasks = await prisma.task.findMany({
        where,
        orderBy: { [sortField]: sortOrder },
        include: { project: { select: { id: true, name: true } } },
      });
    }

    res.json({ data: tasks.map(formatTask) });
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks/:id
export const getTaskById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const task = await prisma.task.findUnique({
      where: { id },
      include: { project: { select: { id: true, name: true } } },
    });

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.json({ data: formatTask(task) });
  } catch (err) {
    next(err);
  }
};

// PUT /api/tasks/:id
export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const parsed = updateTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: getZodMessage(parsed.error) });
      return;
    }

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    if (parsed.data.projectId) {
      const project = await prisma.project.findUnique({ where: { id: parsed.data.projectId } });
      if (!project) {
        res.status(400).json({ error: 'Project not found' });
        return;
      }
    }

    const { labels, dueDate, ...rest } = parsed.data;
    const updateData: any = { ...rest };
    if (labels !== undefined) updateData.labels = JSON.stringify(labels);
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: { project: { select: { id: true, name: true } } },
    });

    res.json({ data: formatTask(task) });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tasks/:id
export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    await prisma.task.delete({ where: { id } });
    res.json({ data: { message: 'Task deleted successfully' } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/tasks/:id/status
export const updateTaskStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: getZodMessage(parsed.error) });
      return;
    }

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const task = await prisma.task.update({
      where: { id },
      data: { status: parsed.data.status },
      include: { project: { select: { id: true, name: true } } },
    });

    res.json({ data: formatTask(task) });
  } catch (err) {
    next(err);
  }
};

// Helper — parse labels JSON string back to array
function formatTask(task: any) {
  return {
    ...task,
    labels: (() => {
      try { return JSON.parse(task.labels); }
      catch { return []; }
    })(),
  };
}
