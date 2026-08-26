export const TASK_STATUSES = ['todo', 'in_progress', 'completed'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export interface TaskProjectRef {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  project: TaskProjectRef | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  labels: string[];
  createdAt: string;
  updatedAt: string;
}
