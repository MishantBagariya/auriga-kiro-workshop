import { prisma } from "../../lib/prisma";
import { serializeTask } from "../tasks/task.service";

const PROJECT_MINIMAL_SELECT = { id: true, name: true } as const;

export async function getDashboard() {
  const [
    totalProjects,
    activeProjects,
    totalTasks,
    statusGroups,
    recentTasks,
    upcomingTasks,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { status: "Active" } }),
    prisma.task.count(),
    prisma.task.groupBy({ by: ["status"], _count: true }),
    prisma.task.findMany({
      orderBy: { updatedDate: "desc" },
      take: 5,
      include: { project: { select: PROJECT_MINIMAL_SELECT } },
    }),
    prisma.task.findMany({
      where: { dueDate: { gte: new Date() } },
      orderBy: { dueDate: "asc" },
      take: 5,
      include: { project: { select: PROJECT_MINIMAL_SELECT } },
    }),
  ]);

  const statusCountMap = new Map(statusGroups.map((g: any) => [g.status, g._count]));

  return {
    stats: {
      totalProjects,
      activeProjects,
      totalTasks,
      toDoTasks: statusCountMap.get("ToDo") ?? 0,
      inProgressTasks: statusCountMap.get("InProgress") ?? 0,
      completedTasks: statusCountMap.get("Completed") ?? 0,
    },
    recentTasks: recentTasks.map(serializeTask),
    upcomingTasks: upcomingTasks.map(serializeTask),
  };
}
