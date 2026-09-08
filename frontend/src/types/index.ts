// Project types
export type ProjectStatus = 'Active' | 'Completed' | 'Archived';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  totalTasks: number;
  completedTasks: number;
}

export interface ProjectDetail extends Project {
  tasks: Task[];
}

// Task types
export type TaskStatus = 'Todo' | 'InProgress' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High';

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
  project: {
    id: string;
    name: string;
  };
}

// Dashboard types
export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  completedTasks: number;
}

export interface RecentTask {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  project: { id: string; name: string };
  updatedAt: string;
}

export interface UpcomingTask {
  id: string;
  title: string;
  dueDate: string;
  priority: TaskPriority;
  project: { id: string; name: string };
}

// API response wrapper
export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  error: string;
}

// Task filters
export interface TaskFilters {
  search?: string;
  projectId?: string;
  status?: TaskStatus | '';
  priority?: TaskPriority | '';
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority';
  order?: 'asc' | 'desc';
}
