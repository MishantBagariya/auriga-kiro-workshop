import { Document, Types } from "mongoose";

export type TaskStatus = "todo" | "in-progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export const TASK_STATUSES: TaskStatus[] = ["todo", "in-progress", "completed"];
export const TASK_PRIORITIES: TaskPriority[] = ["low", "medium", "high"];

export interface ITask extends Document {
  title: string;
  description: string;
  projectId: Types.ObjectId;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  labels: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  projectId: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  labels?: string[];
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  projectId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  labels?: string[];
}

export interface TaskQueryParams {
  search?: string;
  project?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  sortBy?: "createdAt" | "updatedAt" | "dueDate" | "priority";
  sortOrder?: "asc" | "desc";
  page?: string;
  limit?: string;
}
