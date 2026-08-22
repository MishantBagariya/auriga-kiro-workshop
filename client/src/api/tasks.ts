import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "./client";
import type { CreateTaskInput, Task, TaskListParams, TaskStatus, UpdateTaskInput } from "../types";

export function listTasks(params: TaskListParams): Promise<Task[]> {
  const search = new URLSearchParams();
  if (params.search) search.set("search", params.search);
  if (params.projectId) search.set("projectId", params.projectId);
  if (params.status) search.set("status", params.status);
  if (params.priority) search.set("priority", params.priority);
  if (params.sortBy) search.set("sortBy", params.sortBy);
  if (params.sortOrder) search.set("sortOrder", params.sortOrder);
  const qs = search.toString();
  return apiGet<Task[]>(`/tasks${qs ? `?${qs}` : ""}`);
}

export function getTask(id: string): Promise<Task> {
  return apiGet<Task>(`/tasks/${id}`);
}

export function createTask(input: CreateTaskInput): Promise<Task> {
  return apiPost<Task>("/tasks", input);
}

export function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  return apiPut<Task>(`/tasks/${id}`, input);
}

export function updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
  return apiPatch<Task>(`/tasks/${id}/status`, { status });
}

export function deleteTask(id: string): Promise<void> {
  return apiDelete<void>(`/tasks/${id}`);
}
