import { Project } from "../models/project.model";
import { Task } from "../models/task.model";

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  completedTasks: number;
}

interface TaskWithProject {
  _id: unknown;
  title: string;
  status: string;
  priority: string;
  dueDate: unknown;
  projectId: unknown;
  project: { _id: string; name: string } | null;
  labels: string[];
  description: string;
  createdAt: unknown;
  updatedAt: unknown;
}

export const DashboardService = {
  async getStats(): Promise<DashboardStats> {
    const [
      totalProjects,
      activeProjects,
      totalTasks,
      todoTasks,
      inProgressTasks,
      completedTasks,
    ] = await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ status: "active" }),
      Task.countDocuments(),
      Task.countDocuments({ status: "todo" }),
      Task.countDocuments({ status: "in-progress" }),
      Task.countDocuments({ status: "completed" }),
    ]);

    return {
      totalProjects,
      activeProjects,
      totalTasks,
      todoTasks,
      inProgressTasks,
      completedTasks,
    };
  },

  async getRecentTasks(): Promise<TaskWithProject[]> {
    const tasks = await Task.find()
      .populate("projectId", "name")
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    return tasks.map((task) => {
      const populated = task.projectId as unknown as {
        _id: string;
        name: string;
      } | null;
      return {
        ...task,
        projectId: populated?._id || task.projectId,
        project: populated
          ? { _id: populated._id, name: populated.name }
          : null,
      };
    });
  },

  async getUpcomingTasks(): Promise<TaskWithProject[]> {
    const now = new Date();
    const tasks = await Task.find({
      dueDate: { $gte: now },
      status: { $ne: "completed" },
    })
      .populate("projectId", "name")
      .sort({ dueDate: 1 })
      .limit(10)
      .lean();

    return tasks.map((task) => {
      const populated = task.projectId as unknown as {
        _id: string;
        name: string;
      } | null;
      return {
        ...task,
        projectId: populated?._id || task.projectId,
        project: populated
          ? { _id: populated._id, name: populated.name }
          : null,
      };
    });
  },
};
