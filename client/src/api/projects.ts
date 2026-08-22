import { apiDelete, apiGet, apiPost, apiPut } from "./client";
import type { CreateProjectInput, Project, ProjectWithTasks, UpdateProjectInput } from "../types";

export function listProjects(): Promise<Project[]> {
  return apiGet<Project[]>("/projects");
}

export function getProject(id: string): Promise<ProjectWithTasks> {
  return apiGet<ProjectWithTasks>(`/projects/${id}`);
}

export function createProject(input: CreateProjectInput): Promise<Project> {
  return apiPost<Project>("/projects", input);
}

export function updateProject(id: string, input: UpdateProjectInput): Promise<ProjectWithTasks> {
  return apiPut<ProjectWithTasks>(`/projects/${id}`, input);
}

export function deleteProject(id: string): Promise<void> {
  return apiDelete<void>(`/projects/${id}`);
}
