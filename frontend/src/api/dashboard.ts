import apiClient from './client';
import type { DashboardStats, RecentTask, UpcomingTask } from '../types';

export const dashboardApi = {
  getStats: () =>
    apiClient.get<{ data: DashboardStats }>('/dashboard/stats').then((r) => r.data.data),

  getRecentTasks: () =>
    apiClient.get<{ data: RecentTask[] }>('/dashboard/recent').then((r) => r.data.data),

  getUpcomingTasks: () =>
    apiClient.get<{ data: UpcomingTask[] }>('/dashboard/upcoming').then((r) => r.data.data),
};
