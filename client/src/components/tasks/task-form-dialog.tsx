import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { createTaskSchema, type CreateTaskInput, type Task, type Project } from 'shared'
import { api } from '@/lib/api'

interface TaskFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task
  defaultProjectId?: string
}

export function TaskFormDialog({ open, onOpenChange, task, defaultProjectId }: TaskFormDialogProps) {
  const queryClient = useQueryClient()
  const isEditing = !!task

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get<Project[]>('/projects'),
    enabled: open,
  })

  const form = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      projectId: defaultProjectId || '',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: null,
      labels: [],
    },
  })

  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description || '',
        projectId: task.projectId,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] + 'T00:00:00.000Z' : null,
        labels: task.labels || [],
      })
    } else {
      form.reset({
        title: '',
        description: '',
        projectId: defaultProjectId || '',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: null,
        labels: [],
      })
    }
  }, [task, defaultProjectId, form, open])

  const mutation = useMutation({
    mutationFn: (data: CreateTaskInput) =>
      isEditing
        ? api.put<Task>(`/tasks/${task.id}`, data)
        : api.post<Task>('/tasks', data),
    onSuccess: () => {
      toast.success(isEditing ? 'Task updated' : 'Task created')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      onOpenChange(false)
    },
    onError: (error: any) => {
      if (error.code === 'VALIDATION_ERROR' && error.details) {
        error.details.forEach(({ field, message }: { field: string; message: string }) => {
          form.setError(field as keyof CreateTaskInput, { message })
        })
      } else {
        toast.error(error.message || 'Something went wrong')
      }
    },
  })

  function onSubmit(data: CreateTaskInput) {
    const submitData = {
      ...data,
      dueDate: data.dueDate || null,
    }
    mutation.mutate(submitData)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border bg-card p-6 shadow-xl animate-scale-in">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">{isEditing ? 'Edit Task' : 'Create Task'}</h2>
          <button onClick={() => onOpenChange(false)} className="rounded-lg p-1.5 hover:bg-accent transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1.5">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              id="title"
              {...form.register('title')}
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
              placeholder="Enter task title"
              autoFocus
            />
            {form.formState.errors.title && (
              <p className="mt-1.5 text-xs text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="task-description" className="block text-sm font-medium mb-1.5">
              Description
            </label>
            <textarea
              id="task-description"
              {...form.register('description')}
              rows={3}
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all resize-none"
              placeholder="Enter task description"
            />
          </div>

          {/* Project */}
          <div>
            <label htmlFor="projectId" className="block text-sm font-medium mb-1.5">
              Project <span className="text-destructive">*</span>
            </label>
            <select
              id="projectId"
              {...form.register('projectId')}
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all cursor-pointer"
            >
              <option value="">Select a project</option>
              {projects?.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {form.formState.errors.projectId && (
              <p className="mt-1.5 text-xs text-destructive">{form.formState.errors.projectId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label htmlFor="task-status" className="block text-sm font-medium mb-1.5">
                Status
              </label>
              <select
                id="task-status"
                {...form.register('status')}
                className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all cursor-pointer"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="task-priority" className="block text-sm font-medium mb-1.5">
                Priority
              </label>
              <select
                id="task-priority"
                {...form.register('priority')}
                className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all cursor-pointer"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium mb-1.5">
              Due Date
            </label>
            <input
              id="dueDate"
              type="date"
              {...form.register('dueDate', {
                setValueAs: (v: string) => v ? `${v}T00:00:00.000Z` : null,
              })}
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
            />
          </div>

          {/* Labels */}
          <div>
            <label htmlFor="labels" className="block text-sm font-medium mb-1.5">
              Labels <span className="text-xs text-muted-foreground font-normal">(comma-separated)</span>
            </label>
            <input
              id="labels"
              type="text"
              defaultValue={task?.labels?.join(', ') || ''}
              onChange={(e) => {
                const labels = e.target.value
                  .split(',')
                  .map((l) => l.trim())
                  .filter(Boolean)
                form.setValue('labels', labels)
              }}
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
              placeholder="e.g. frontend, bug, urgent"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 disabled:opacity-50 transition-all"
            >
              {mutation.isPending ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
