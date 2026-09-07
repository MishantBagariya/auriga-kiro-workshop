// Shared TypeScript types for TaskFlow.

// --- Constant value sets (single source of truth for statuses/priorities) ---

export const PROJECT_STATUSES = ["active", "completed", "archived"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const TASK_STATUSES = ["todo", "in_progress", "completed"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["low", "medium", "high"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "dueDate",
  "priority",
] as const;
export type TaskSortField = (typeof TASK_SORT_FIELDS)[number];

export const SORT_ORDERS = ["asc", "desc"] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];

// --- Entity shapes (serialized form returned by the API, dates as ISO strings) ---

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  projectId: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  labels: string[];
  createdAt: string;
  updatedAt: string;
}

// --- Derived / composite shapes for list and detail views ---

export interface ProjectWithCounts extends Project {
  totalTasks: number;
  completedTasks: number;
}

export interface ProjectWithTasks extends ProjectWithCounts {
  tasks: Task[];
}

export interface TaskWithProject extends Task {
  project: Pick<Project, "id" | "name">;
}

// --- Dashboard ---

export interface DashboardSummary {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  completedTasks: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  recentTasks: TaskWithProject[];
  upcomingTasks: TaskWithProject[];
}

// --- Task list query parameters (search / filter / sort / paginate) ---

export interface TaskListParams {
  search?: string;
  projectId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  sortBy?: TaskSortField;
  order?: SortOrder;
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
