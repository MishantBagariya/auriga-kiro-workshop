export const PROJECT_STATUSES = ['active', 'completed', 'archived'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  taskCount: number;
  completedTaskCount: number;
  createdAt: string;
  updatedAt: string;
}
