import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { cn, getStatusColor, getPriorityColor, getStatusLabel, getPriorityLabel, formatDate } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import { FolderOpen, CheckSquare, Clock, AlertCircle, TrendingUp, ListTodo, ArrowRight } from 'lucide-react'
import type { DashboardData } from 'shared'

export function DashboardPage() {
  const navigate = useNavigate()
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get<DashboardData>('/dashboard'),
  })

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 animate-fade-in">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <p className="text-sm text-destructive">Failed to load dashboard data</p>
      </div>
    )
  }

  if (!data) return null

  const statCards = [
    { label: 'Total Projects', value: data.projectStats.total, icon: FolderOpen, gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Projects', value: data.projectStats.active, icon: TrendingUp, gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Tasks', value: data.taskStats.total, icon: CheckSquare, gradient: 'from-purple-500 to-purple-600', bg: 'bg-purple-50' },
    { label: 'To Do', value: data.taskStats.todo, icon: ListTodo, gradient: 'from-slate-500 to-slate-600', bg: 'bg-slate-50' },
    { label: 'In Progress', value: data.taskStats.inProgress, icon: Clock, gradient: 'from-amber-500 to-amber-600', bg: 'bg-amber-50' },
    { label: 'Completed', value: data.taskStats.completed, icon: CheckSquare, gradient: 'from-green-500 to-green-600', bg: 'bg-green-50' },
  ]

  return (
    <div className="space-y-8">
      <div className="animate-slide-up">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your projects and tasks</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {statCards.map((stat, i) => (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-xl border bg-card p-4 transition-all duration-300 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5 animate-slide-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-center gap-2">
              <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', stat.bg)}>
                <stat.icon className={cn('h-4 w-4 bg-gradient-to-r bg-clip-text', stat.gradient)} style={{ color: `var(--tw-gradient-from)` }} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight">{stat.value}</p>
            <p className="text-xs font-medium text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Tasks */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden animate-slide-up" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="font-semibold tracking-tight">Recent Tasks</h2>
            <button
              onClick={() => navigate('/tasks')}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="divide-y">
            {data.recentTasks.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">No tasks yet</p>
            ) : (
              data.recentTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex cursor-pointer items-center justify-between px-5 py-3.5 hover:bg-accent/50 transition-colors"
                  onClick={() => navigate(`/tasks/${task.id}`)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{task.project?.name}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-semibold', getStatusColor(task.status))}>
                      {getStatusLabel(task.status)}
                    </span>
                    <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-semibold', getPriorityColor(task.priority))}>
                      {getPriorityLabel(task.priority)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="font-semibold tracking-tight">Upcoming Tasks</h2>
            <button
              onClick={() => navigate('/tasks?sortBy=dueDate&sortOrder=asc')}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="divide-y">
            {data.upcomingTasks.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">No upcoming tasks</p>
            ) : (
              data.upcomingTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex cursor-pointer items-center justify-between px-5 py-3.5 hover:bg-accent/50 transition-colors"
                  onClick={() => navigate(`/tasks/${task.id}`)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{task.project?.name}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {formatDate(task.dueDate)}
                    </span>
                    <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-semibold', getPriorityColor(task.priority))}>
                      {getPriorityLabel(task.priority)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <div className="h-9 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="mt-2 h-5 w-72 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[100px] animate-pulse rounded-xl border bg-muted" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-[320px] animate-pulse rounded-xl border bg-muted" />
        <div className="h-[320px] animate-pulse rounded-xl border bg-muted" />
      </div>
    </div>
  )
}
