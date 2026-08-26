import { apiClient } from '../../../lib/apiClient';
import type { Project } from '../../../types/project';
import type { CreateProjectInput, UpdateProjectInput } from '../types';

export async function listProjects(): Promise<Project[]> {
  const res = await apiClient.get<Project[]>('/projects');
  return res.data;
}

export async function getProject(id: string): Promise<Project> {
  const res = await apiClient.get<Project>(`/projects/${id}`);
  return res.data;
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const res = await apiClient.post<Project>('/projects', input);
  return res.data;
}

export async function updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
  const res = await apiClient.patch<Project>(`/projects/${id}`, input);
  return res.data;
}

export async function deleteProject(id: string): Promise<void> {
  await apiClient.delete<void>(`/projects/${id}`);
}
