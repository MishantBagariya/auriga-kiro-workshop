import { Project } from '../../models/project.model.js';
import { Task } from '../../models/task.model.js';

const DEFAULT_RECENT_LIMIT = 5;
const DEFAULT_UPCOMING_LIMIT = 5;

async function attachProjectRefs(tasks: Record<string, unknown>[]) {
  const projectIds = [...new Set(tasks.map((t) => t.projectId as string))];
  const projects = await Project.find({ _id: { $in: projectIds } }, { name: 1 });
  const byId = new Map(
    projects.map((p) => {
      const id = p._id.toString();
      return [id, { id, name: String(p.name) }];
    }),
  );
  return tasks.map((t) => ({ ...t, project: byId.get(t.projectId as string) ?? null }));
}

/**
 * Computed with aggregation rather than loading every document and
 * counting in application code, per api-standards.md.
 */
async function getStats() {
  const [totalProjects, activeProjects, totalTasks, todoTasks, inProgressTasks, completedTasks] = await Promise.all([
    Project.countDocuments(),
    Project.countDocuments({ status: 'active' }),
    Task.countDocuments(),
    Task.countDocuments({ status: 'todo' }),
    Task.countDocuments({ status: 'in_progress' }),
    Task.countDocuments({ status: 'completed' }),
  ]);

  return { totalProjects, activeProjects, totalTasks, todoTasks, inProgressTasks, completedTasks };
}

async function getRecentTasks(limit: number) {
  const tasks = await Task.find().sort({ updatedAt: -1 }).limit(limit);
  return attachProjectRefs(tasks.map((t) => t.toJSON()));
}

async function getUpcomingTasks(limit: number) {
  const tasks = await Task.find({
    dueDate: { $ne: null },
    status: { $ne: 'completed' },
  })
    .sort({ dueDate: 1 })
    .limit(limit);
  return attachProjectRefs(tasks.map((t) => t.toJSON()));
}

export async function getDashboardSummary(options: { recentLimit?: number; upcomingLimit?: number } = {}) {
  const recentLimit = options.recentLimit ?? DEFAULT_RECENT_LIMIT;
  const upcomingLimit = options.upcomingLimit ?? DEFAULT_UPCOMING_LIMIT;

  const [stats, recentTasks, upcomingTasks] = await Promise.all([
    getStats(),
    getRecentTasks(recentLimit),
    getUpcomingTasks(upcomingLimit),
  ]);

  return { stats, recentTasks, upcomingTasks };
}
