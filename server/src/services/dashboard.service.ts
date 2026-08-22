import { prisma } from '../lib/prisma.js'

export const dashboardService = {
  async getDashboardData() {
    const [
      totalProjects,
      activeProjects,
      completedProjects,
      archivedProjects,
      totalTasks,
      todoTasks,
      inProgressTasks,
      completedTasks,
      recentTasks,
      upcomingTasks,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: 'ACTIVE' } }),
      prisma.project.count({ where: { status: 'COMPLETED' } }),
      prisma.project.count({ where: { status: 'ARCHIVED' } }),
      prisma.task.count(),
      prisma.task.count({ where: { status: 'TODO' } }),
      prisma.task.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { status: 'COMPLETED' } }),
      prisma.task.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 10,
        include: { project: { select: { id: true, name: true } } },
      }),
      prisma.task.findMany({
        where: {
          dueDate: { gte: new Date() },
          status: { not: 'COMPLETED' },
        },
        orderBy: { dueDate: 'asc' },
        take: 10,
        include: { project: { select: { id: true, name: true } } },
      }),
    ])

    return {
      projectStats: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
        archived: archivedProjects,
      },
      taskStats: {
        total: totalTasks,
        todo: todoTasks,
        inProgress: inProgressTasks,
        completed: completedTasks,
      },
      recentTasks,
      upcomingTasks,
    }
  },
}
