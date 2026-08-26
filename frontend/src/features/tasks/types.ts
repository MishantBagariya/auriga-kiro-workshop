import type { TaskPriority, TaskStatus } from '../../types/task';

/** Form shapes and view models for the tasks feature only. */
export interface CreateTaskInput {
  title: string;
  description?: string;
  projectId: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  labels?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  projectId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  labels?: string[];
}

export type SortBy = 'createdAt' | 'updatedAt' | 'dueDate' | 'priority';
export type SortOrder = 'asc' | 'desc';
export type ViewMode = 'list' | 'board';

export interface TaskFilters {
  search?: string;
  projectId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}
