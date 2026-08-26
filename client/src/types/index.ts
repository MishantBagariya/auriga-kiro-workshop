export type ProjectStatus = "active" | "completed" | "archived";
export type TaskStatus = "todo" | "in-progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export interface Project {
  _id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectWithStats extends Project {
  taskCount: number;
  completedTaskCount: number;
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

export interface Task {
  _id: string;
  title: string;
  description: string;
  projectId: string;
  project?: Project;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  labels: string[];
  createdAt: string;
  updatedAt: string;
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

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  completedTasks: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

export interface TaskQueryParams {
  search?: string;
  project?: string;
  status?: TaskStatus | "";
  priority?: TaskPriority | "";
  sortBy?: "createdAt" | "updatedAt" | "dueDate" | "priority";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}
