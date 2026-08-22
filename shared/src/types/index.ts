export interface Project {
  id: string
  name: string
  description: string
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'
  createdAt: string
  updatedAt: string
  _count?: {
    tasks: number
  }
  taskCount?: number
  completedTaskCount?: number
}

export interface Task {
  id: string
  title: string
  description: string
  projectId: string
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  dueDate: string | null
  labels: string[]
  createdAt: string
  updatedAt: string
  project?: Pick<Project, 'id' | 'name'>
}

export interface DashboardData {
  projectStats: {
    total: number
    active: number
    completed: number
    archived: number
  }
  taskStats: {
    total: number
    todo: number
    inProgress: number
    completed: number
  }
  recentTasks: Task[]
  upcomingTasks: Task[]
}

export interface ApiResponse<T> {
  data: T
}

export interface ApiError {
  error: {
    message: string
    code: string
    details?: { field: string; message: string }[]
  }
}
