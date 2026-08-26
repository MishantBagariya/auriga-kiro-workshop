import type { ProjectStatus } from '../../types/project';

/** Form shapes and view models for the projects feature only. */
export interface CreateProjectInput {
  name: string;
  description?: string;
  status?: ProjectStatus;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string | null;
  status?: ProjectStatus;
}
