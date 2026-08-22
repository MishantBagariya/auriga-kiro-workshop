import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Pencil, Trash2, AlertCircle, Calendar, Tag } from 'lucide-react'
import { api } from '@/lib/api'
import { cn, getStatusColor, getPriorityColor, getStatusLabel, getPriorityLabel, formatDate } from '@/lib/utils'
import { TaskFormDialog } from '@/components/tasks/task-form-dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import type { Task } from 'shared'

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { data: task, isLoading, error } = useQuery({
    queryKey: ['tasks', id],
    queryFn: () => api.get<Task>(`/tasks/${id}`),
    enabled: !!id,
  })

  const statusMutation = useMutation({
    mutationFn: (status: string) => api.patch<Task>(`/tasks/${id}/status`, { status }),
    onSuccess: () => {
      toast.success('Status updated')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
    onError: () => {
      toast.error('Failed to update status')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/tasks/${id}`),
    onSuccess: () => {
      toast.success('Task deleted')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      navigate('/tasks')
    },
    onError: () => {
      toast.error('Failed to delete task')
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-5 w-24 animate-pulse rounded-lg bg-muted" />
        <div className="h-10 w-72 animate-pulse rounded-lg bg-muted" />
        <div className="h-48 animate-pulse rounded-xl border bg-muted" />
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="space-y-4 animate-fade-in">
        <button onClick={() => navigate('/tasks')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Tasks
        </button>
        <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-sm text-destructive">Task not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => navigate('/tasks')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Tasks
      </button>

      {/* Header */}
      <div className="flex items-start justify-between animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{task.title}</h1>
          <p className="mt-1.5 text-muted-foreground">
            in{' '}
            <button
              onClick={() => navigate(`/projects/${task.projectId}`)}
              className="text-primary font-medium hover:underline transition-colors"
            >
              {task.project?.name}
            </button>
          </p>
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

      {/* Status Controls */}
      <div className="flex items-center gap-3 animate-slide-up" style={{ animationDelay: '50ms' }}>
        <span className="text-sm font-medium text-muted-foreground">Status:</span>
        <div className="flex rounded-xl border bg-muted/50 p-0.5">
          {['TODO', 'IN_PROGRESS', 'COMPLETED'].map((s) => (
            <button
              key={s}
              onClick={() => statusMutation.mutate(s)}
              disabled={task.status === s || statusMutation.isPending}
              className={cn(
                'rounded-lg px-4 py-1.5 text-xs font-semibold transition-all duration-200',
                task.status === s
                  ? cn('bg-white shadow-sm', getStatusColor(s))
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {getStatusLabel(s)}
            </button>
          ))}
        </div>
      </div>

      {/* Details Card */}
      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-5 animate-slide-up" style={{ animationDelay: '100ms' }}>
        {task.description && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</h3>
            <p className="mt-2 whitespace-pre-wrap leading-relaxed">{task.description}</p>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Priority</h3>
            <span className={cn('mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold', getPriorityColor(task.priority))}>
              {getPriorityLabel(task.priority)}
            </span>
          </div>

          {task.dueDate && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Due Date</h3>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{formatDate(task.dueDate)}</span>
              </div>
            </div>
          )}

          {task.labels && task.labels.length > 0 && (
            <div className="sm:col-span-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Labels</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {task.labels.map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground"
                  >
                    <Tag className="h-3 w-3" />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Created</h3>
            <p className="mt-2 text-sm font-medium">{formatDate(task.createdAt)}</p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Last Updated</h3>
            <p className="mt-2 text-sm font-medium">{formatDate(task.updatedAt)}</p>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <TaskFormDialog open={editOpen} onOpenChange={setEditOpen} task={task} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Task"
        description={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        onConfirm={() => deleteMutation.mutate()}
        loading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  )
}
