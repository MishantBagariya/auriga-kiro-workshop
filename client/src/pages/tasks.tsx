import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Search, AlertCircle, LayoutGrid, List } from 'lucide-react'
import { api } from '@/lib/api'
import { cn, getStatusColor, getPriorityColor, getStatusLabel, getPriorityLabel, formatDate } from '@/lib/utils'
import { TaskFormDialog } from '@/components/tasks/task-form-dialog'
import { TaskBoardView } from '@/components/tasks/task-board-view'
import type { Task, Project } from 'shared'

export function TasksPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [createOpen, setCreateOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list')

  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const priority = searchParams.get('priority') || ''
  const projectId = searchParams.get('projectId') || ''
  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const sortOrder = searchParams.get('sortOrder') || 'desc'

  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks', { search, status, priority, projectId, sortBy, sortOrder }],
    queryFn: () =>
      api.get<Task[]>('/tasks', {
        search: search || undefined,
        status: status || undefined,
        priority: priority || undefined,
        projectId: projectId || undefined,
        sortBy,
        sortOrder,
      }),
  })

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get<Project[]>('/projects'),
  })

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    setSearchParams(params)
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 animate-fade-in">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <p className="text-sm text-destructive">Failed to load tasks</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage all your tasks</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border bg-muted/50 p-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'rounded-lg px-3 py-1.5 transition-all duration-200',
                viewMode === 'list' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={cn(
                'rounded-lg px-3 py-1.5 transition-all duration-200',
                viewMode === 'board' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label="Board view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            Create Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 animate-slide-up" style={{ animationDelay: '50ms' }}>
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full rounded-xl border bg-white pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
          />
        </div>

        {/* Project Filter */}
        <select
          value={projectId}
          onChange={(e) => updateFilter('projectId', e.target.value)}
          className="rounded-xl border bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all cursor-pointer"
        >
          <option value="">All Projects</option>
          {projects?.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => updateFilter('status', e.target.value)}
          className="rounded-xl border bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>

        {/* Priority Filter */}
        <select
          value={priority}
          onChange={(e) => updateFilter('priority', e.target.value)}
          className="rounded-xl border bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all cursor-pointer"
        >
          <option value="">All Priorities</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        {/* Sort */}
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [by, order] = e.target.value.split('-')
            updateFilter('sortBy', by)
            updateFilter('sortOrder', order)
          }}
          className="rounded-xl border bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all cursor-pointer"
        >
          <option value="createdAt-desc">Newest First</option>
          <option value="createdAt-asc">Oldest First</option>
          <option value="updatedAt-desc">Recently Updated</option>
          <option value="dueDate-asc">Due Date (Earliest)</option>
          <option value="dueDate-desc">Due Date (Latest)</option>
          <option value="priority-desc">Priority (High to Low)</option>
          <option value="priority-asc">Priority (Low to High)</option>
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[60px] animate-pulse rounded-xl border bg-muted" />
          ))}
        </div>
      ) : viewMode === 'board' ? (
        <TaskBoardView tasks={tasks || []} />
      ) : tasks && tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-16 animate-fade-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Search className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <h3 className="mt-5 text-lg font-semibold">
            {search || status || priority || projectId ? 'No matching tasks' : 'No tasks yet'}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {search || status || priority || projectId
              ? 'Try adjusting your search or filters'
              : 'Create your first task to get started'}
          </p>
          {!search && !status && !priority && !projectId && (
            <button
              onClick={() => setCreateOpen(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
            >
              <Plus className="h-4 w-4" />
              Create Task
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="divide-y">
            {tasks?.map((task) => (
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
                  {task.dueDate && (
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {formatDate(task.dueDate)}
                    </span>
                  )}
                  <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-semibold', getStatusColor(task.status))}>
                    {getStatusLabel(task.status)}
                  </span>
                  <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-semibold', getPriorityColor(task.priority))}>
                    {getPriorityLabel(task.priority)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Task Dialog */}
      <TaskFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
