import apiClient from './client';
import type { Project, ProjectDetail } from '../types';

export const projectsApi = {
  getAll: () =>
    apiClient.get<{ data: Project[] }>('/projects').then((r) => r.data.data),

  getById: (id: string) =>
    apiClient.get<{ data: ProjectDetail }>(`/projects/${id}`).then((r) => r.data.data),

  create: (data: { name: string; description?: string; status?: string }) =>
    apiClient.post<{ data: Project }>('/projects', data).then((r) => r.data.data),

  update: (id: string, data: { name?: string; description?: string; status?: string }) =>
    apiClient.put<{ data: Project }>(`/projects/${id}`, data).then((r) => r.data.data),

  delete: (id: string) =>
    apiClient.delete(`/projects/${id}`).then((r) => r.data),
};
