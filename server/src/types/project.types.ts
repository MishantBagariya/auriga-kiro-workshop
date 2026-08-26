import { Document } from "mongoose";

export type ProjectStatus = "active" | "completed" | "archived";

export const PROJECT_STATUSES: ProjectStatus[] = [
  "active",
  "completed",
  "archived",
];

export interface IProject extends Document {
  name: string;
  description: string;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  status?: ProjectStatus;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  status?: ProjectStatus;
}
