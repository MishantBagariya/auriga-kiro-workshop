import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Pencil, Trash2, Plus, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { cn, getStatusColor, getStatusLabel, getPriorityColor, getPriorityLabel, formatDate } from '@/lib/utils'
import { ProjectFormDialog } from '@/components/projects/project-form-dialog'
import { TaskFormDialog } from '@/components/tasks/task-form-dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import type { Project, Task } from 'shared'

interface ProjectDetail extends Project {
  tasks: Task[]
}

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [createTaskOpen, setCreateTaskOpen] = useState(false)

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['projects', id],
    queryFn: () => api.get<ProjectDetail>(`/projects/${id}`),
    enabled: !!id,
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/projects/${id}`),
    onSuccess: () => {
      toast.success('Project deleted')
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      navigate('/projects')
    },
    onError: () => {
      toast.error('Failed to delete project')
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-5 w-28 animate-pulse rounded-lg bg-muted" />
        <div className="h-10 w-72 animate-pulse rounded-lg bg-muted" />
        <div className="h-24 w-full animate-pulse rounded-xl border bg-muted" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl border bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="space-y-4 animate-fade-in">
        <button onClick={() => navigate('/projects')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Projects
        </button>
        <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-sm text-destructive">Project not found</p>
        </div>
      </div>
    )
  }

  const completedTasks = project.tasks?.filter((t) => t.status === 'COMPLETED').length || 0
  const totalTasks = project.tasks?.length || 0
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => navigate('/projects')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Projects
      </button>

      {/* Project Header */}
      <div className="flex items-start justify-between">
        <div className="animate-slide-up">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <span className={cn('rounded-full px-3 py-0.5 text-xs font-semibold', getStatusColor(project.status))}>
              {getStatusLabel(project.status)}
            </span>
          </div>
          {project.description && (
            <p className="mt-2 text-muted-foreground leading-relaxed max-w-2xl">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEditOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium hover:bg-accent transition-colors"
          >
            <Pencil className="h-4 w-4" /> Edit
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-destructive/20 px-3.5 py-2 text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 animate-slide-up" style={{ animationDelay: '50ms' }}>
        <div className="rounded-xl border bg-card px-5 py-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Total Tasks</p>
          <p className="text-2xl font-bold tracking-tight mt-1">{totalTasks}</p>
        </div>
        <div className="rounded-xl border bg-card px-5 py-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold tracking-tight mt-1">{completedTasks}</p>
        </div>
        <div className="rounded-xl border bg-card px-5 py-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Progress</p>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-2xl font-bold tracking-tight">{progress}%</p>
            <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Tasks</h2>
          <button
            onClick={() => setCreateTaskOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
          >
            <Plus className="h-4 w-4" /> Add Task
          </button>
        </div>

        {totalTasks === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-10">
            <p className="text-sm text-muted-foreground">No tasks in this project</p>
            <button
              onClick={() => setCreateTaskOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
            >
              <Plus className="h-4 w-4" /> Create First Task
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="divide-y">
              {project.tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex cursor-pointer items-center justify-between px-5 py-3.5 hover:bg-accent/50 transition-colors"
                  onClick={() => navigate(`/tasks/${task.id}`)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{task.title}</p>
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
      </div>

      {/* Dialogs */}
      <ProjectFormDialog open={editOpen} onOpenChange={setEditOpen} project={project} />
      <TaskFormDialog open={createTaskOpen} onOpenChange={setCreateTaskOpen} defaultProjectId={project.id} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Project"
        description={`Are you sure you want to delete "${project.name}"? This will also delete all ${totalTasks} task(s) associated with this project.`}
        onConfirm={() => deleteMutation.mutate()}
        loading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  )
}
