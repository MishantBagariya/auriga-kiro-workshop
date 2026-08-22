export const PROJECT_STATUSES = ["Active", "Completed", "Archived"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const TASK_STATUSES = ["To Do", "In Progress", "Completed"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["Low", "Medium", "High"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_SORT_FIELDS = ["createdDate", "updatedDate", "dueDate", "priority"] as const;
export type TaskSortField = (typeof TASK_SORT_FIELDS)[number];

export type SortOrder = "asc" | "desc";

export interface ProjectRef {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  createdDate: string;
  updatedDate: string;
  taskCount: number;
  completedTaskCount: number;
}

export interface ProjectWithTasks extends Project {
  tasks: Task[];
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  projectId: string;
  project: ProjectRef;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  labels: string[];
  createdDate: string;
  updatedDate: string;
}

export interface TaskListParams {
  search?: string;
  projectId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  sortBy?: TaskSortField;
  sortOrder?: SortOrder;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  status?: ProjectStatus;
}

export type UpdateProjectInput = Partial<CreateProjectInput>;

export interface CreateTaskInput {
  title: string;
  projectId: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  description?: string;
  dueDate?: string | null;
  labels?: string[];
}

export type UpdateTaskInput = Partial<CreateTaskInput>;

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  toDoTasks: number;
  inProgressTasks: number;
  completedTasks: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentTasks: Task[];
  upcomingTasks: Task[];
}

export interface ApiErrorShape {
  message: string;
  fields?: Record<string, string>;
}

export class ApiError extends Error {
  fields?: Record<string, string>;
  status: number;

  constructor(status: number, shape: ApiErrorShape) {
    super(shape.message);
    this.status = status;
    this.fields = shape.fields;
  }
}
