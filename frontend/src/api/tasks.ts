import apiClient from './client';
import type { Task, TaskFilters } from '../types';

export const tasksApi = {
  getAll: (filters?: TaskFilters) =>
    apiClient.get<{ data: Task[] }>('/tasks', { params: filters }).then((r) => r.data.data),

  getById: (id: string) =>
    apiClient.get<{ data: Task }>(`/tasks/${id}`).then((r) => r.data.data),

  create: (data: {
    title: string;
    projectId: string;
    status: string;
    priority: string;
    description?: string;
    dueDate?: string | null;
    labels?: string[];
  }) =>
    apiClient.post<{ data: Task }>('/tasks', data).then((r) => r.data.data),

  update: (
    id: string,
    data: {
      title?: string;
      description?: string | null;
      projectId?: string;
      status?: string;
      priority?: string;
      dueDate?: string | null;
      labels?: string[];
    }
  ) =>
    apiClient.put<{ data: Task }>(`/tasks/${id}`, data).then((r) => r.data.data),

  updateStatus: (id: string, status: string) =>
    apiClient.patch<{ data: Task }>(`/tasks/${id}/status`, { status }).then((r) => r.data.data),

  delete: (id: string) =>
    apiClient.delete(`/tasks/${id}`).then((r) => r.data),
};
