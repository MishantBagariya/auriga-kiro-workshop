import { handleUnexpected, success } from "@/lib/api";
import { db } from "@/lib/db";
import { serializeTaskWithProject } from "@/lib/serializers";
import type { DashboardData, DashboardSummary } from "@/types";

const RECENT_TASK_LIMIT = 5;
const UPCOMING_TASK_LIMIT = 5;
const UPCOMING_WINDOW_DAYS = 7;

const taskWithProjectInclude = {
  project: { select: { id: true, name: true } },
} as const;

// GET /api/dashboard — summary stats, recent tasks, and upcoming tasks.
export async function GET() {
  try {
    const now = new Date();
    const windowEnd = new Date(now);
    windowEnd.setDate(windowEnd.getDate() + UPCOMING_WINDOW_DAYS);

    const [
      totalProjects,
      activeProjects,
      totalTasks,
      statusGroups,
      recentRows,
      upcomingRows,
    ] = await Promise.all([
      db.project.count(),
      db.project.count({ where: { status: "active" } }),
      db.task.count(),
      db.task.groupBy({ by: ["status"], _count: { _all: true } }),
      db.task.findMany({
        orderBy: { updatedAt: "desc" },
        take: RECENT_TASK_LIMIT,
        include: taskWithProjectInclude,
      }),
      db.task.findMany({
        where: {
          status: { not: "completed" },
          dueDate: { gte: now, lte: windowEnd },
        },
        orderBy: { dueDate: "asc" },
        take: UPCOMING_TASK_LIMIT,
        include: taskWithProjectInclude,
      }),
    ]);

    const countByStatus = new Map(
      statusGroups.map((g) => [g.status, g._count._all]),
    );

    const summary: DashboardSummary = {
      totalProjects,
      activeProjects,
      totalTasks,
      todoTasks: countByStatus.get("todo") ?? 0,
      inProgressTasks: countByStatus.get("in_progress") ?? 0,
      completedTasks: countByStatus.get("completed") ?? 0,
    };

    const data: DashboardData = {
      summary,
      recentTasks: recentRows.map(serializeTaskWithProject),
      upcomingTasks: upcomingRows.map(serializeTaskWithProject),
    };

    return success(data);
  } catch (err) {
    return handleUnexpected(err);
  }
}
