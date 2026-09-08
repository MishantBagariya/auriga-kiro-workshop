import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  status: z.enum(['Active', 'Completed', 'Archived']).optional().default('Active'),
});

const updateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').optional(),
  description: z.string().optional(),
  status: z.enum(['Active', 'Completed', 'Archived']).optional(),
});

function getZodMessage(error: z.ZodError): string {
  const issues = (error as any).issues ?? [];
  return issues.length > 0 ? issues[0].message : 'Invalid request data';
}

// POST /api/projects
export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: getZodMessage(parsed.error) });
      return;
    }

    const project = await prisma.project.create({
      data: parsed.data,
    });

    res.status(201).json({ data: project });
  } catch (err) {
    next(err);
  }
};

// GET /api/projects
export const getAllProjects = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { tasks: true } },
        tasks: { select: { status: true } },
      },
    });

    const result = projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      totalTasks: p._count.tasks,
      completedTasks: p.tasks.filter((t) => t.status === 'Completed').length,
    }));

    res.json({ data: result });
  } catch (err) {
    next(err);
  }
};

// GET /api/projects/:id
export const getProjectById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        tasks: { orderBy: { createdAt: 'desc' } },
        _count: { select: { tasks: true } },
      },
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const result = {
      ...project,
      totalTasks: project._count.tasks,
      completedTasks: project.tasks.filter((t) => t.status === 'Completed').length,
    };

    res.json({ data: result });
  } catch (err) {
    next(err);
  }
};

// PUT /api/projects/:id
export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const parsed = updateProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: getZodMessage(parsed.error) });
      return;
    }

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const project = await prisma.project.update({
      where: { id },
      data: parsed.data,
    });

    res.json({ data: project });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/projects/:id
export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    await prisma.project.delete({ where: { id } });
    res.json({ data: { message: 'Project deleted successfully' } });
  } catch (err) {
    next(err);
  }
};
