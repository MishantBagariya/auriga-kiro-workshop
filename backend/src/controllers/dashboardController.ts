import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

// GET /api/dashboard/stats
export const getStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      totalProjects,
      activeProjects,
      totalTasks,
      todoTasks,
      inProgressTasks,
      completedTasks,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: 'Active' } }),
      prisma.task.count(),
      prisma.task.count({ where: { status: 'Todo' } }),
      prisma.task.count({ where: { status: 'InProgress' } }),
      prisma.task.count({ where: { status: 'Completed' } }),
    ]);

    res.json({
      data: {
        totalProjects,
        activeProjects,
        totalTasks,
        todoTasks,
        inProgressTasks,
        completedTasks,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/recent
export const getRecentTasks = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 10,
      include: { project: { select: { id: true, name: true } } },
    });

    const result = tasks.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      project: t.project,
      updatedAt: t.updatedAt,
    }));

    res.json({ data: result });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/upcoming
export const getUpcomingTasks = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();

    const tasks = await prisma.task.findMany({
      where: {
        dueDate: { gte: now },
        status: { not: 'Completed' },
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
      include: { project: { select: { id: true, name: true } } },
    });

    const result = tasks.map((t) => ({
      id: t.id,
      title: t.title,
      dueDate: t.dueDate,
      priority: t.priority,
      project: t.project,
    }));

    res.json({ data: result });
  } catch (err) {
    next(err);
  }
};
