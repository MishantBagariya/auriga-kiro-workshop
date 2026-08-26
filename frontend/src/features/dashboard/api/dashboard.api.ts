import { apiClient } from '../../../lib/apiClient';
import type { Task } from '../../../types/task';

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  completedTasks: number;
}

export interface DashboardSummary {
  stats: DashboardStats;
  recentTasks: Task[];
  upcomingTasks: Task[];
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const res = await apiClient.get<DashboardSummary>('/dashboard/summary');
  return res.data;
}
