import { api } from "./api";
import type { DashboardStats, Task, ApiResponse } from "../types";

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await api.get<unknown, ApiResponse<DashboardStats>>(
      "/dashboard/stats",
    );
    return response.data;
  },

  async getRecentTasks(): Promise<Task[]> {
    const response = await api.get<unknown, ApiResponse<Task[]>>(
      "/dashboard/recent-tasks",
    );
    return response.data;
  },

  async getUpcomingTasks(): Promise<Task[]> {
    const response = await api.get<unknown, ApiResponse<Task[]>>(
      "/dashboard/upcoming-tasks",
    );
    return response.data;
  },
};
