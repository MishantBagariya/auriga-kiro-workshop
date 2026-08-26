import { apiClient } from '../../../lib/apiClient';
import type { ListResult } from '../../../types/api';
import type { Task, TaskStatus } from '../../../types/task';
import type { CreateTaskInput, TaskFilters, UpdateTaskInput } from '../types';

export async function listTasks(filters: TaskFilters): Promise<ListResult<Task>> {
  const res = await apiClient.get<Task[]>('/tasks', filters as Record<string, string | number | undefined>);
  return { data: res.data, meta: res.meta! };
}

export async function getTask(id: string): Promise<Task> {
  const res = await apiClient.get<Task>(`/tasks/${id}`);
  return res.data;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const res = await apiClient.post<Task>('/tasks', input);
  return res.data;
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  const res = await apiClient.patch<Task>(`/tasks/${id}`, input);
  return res.data;
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
  const res = await apiClient.patch<Task>(`/tasks/${id}/status`, { status });
  return res.data;
}

export async function deleteTask(id: string): Promise<void> {
  await apiClient.delete<void>(`/tasks/${id}`);
}
