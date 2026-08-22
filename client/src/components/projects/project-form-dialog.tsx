import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { createProjectSchema, type CreateProjectInput, type Project } from 'shared'
import { api } from '@/lib/api'

interface ProjectFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: Project
}

export function ProjectFormDialog({ open, onOpenChange, project }: ProjectFormDialogProps) {
  const queryClient = useQueryClient()
  const isEditing = !!project

  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'ACTIVE',
    },
  })

  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
        description: project.description || '',
        status: project.status,
      })
    } else {
      form.reset({ name: '', description: '', status: 'ACTIVE' })
    }
  }, [project, form, open])

  const mutation = useMutation({
    mutationFn: (data: CreateProjectInput) =>
      isEditing
        ? api.put<Project>(`/projects/${project.id}`, data)
        : api.post<Project>('/projects', data),
    onSuccess: () => {
      toast.success(isEditing ? 'Project updated' : 'Project created')
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      onOpenChange(false)
    },
    onError: (error: any) => {
      if (error.code === 'VALIDATION_ERROR' && error.details) {
        error.details.forEach(({ field, message }: { field: string; message: string }) => {
          form.setError(field as keyof CreateProjectInput, { message })
        })
      } else {
        toast.error(error.message || 'Something went wrong')
      }
    },
  })

  function onSubmit(data: CreateProjectInput) {
    mutation.mutate(data)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative z-50 w-full max-w-lg rounded-2xl border bg-card p-6 shadow-xl animate-scale-in">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">{isEditing ? 'Edit Project' : 'Create Project'}</h2>
          <button onClick={() => onOpenChange(false)} className="rounded-lg p-1.5 hover:bg-accent transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1.5">
              Project Name <span className="text-destructive">*</span>
            </label>
            <input
              id="name"
              {...form.register('name')}
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
              placeholder="Enter project name"
              autoFocus
            />
            {form.formState.errors.name && (
              <p className="mt-1.5 text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1.5">
              Description
            </label>
            <textarea
              id="description"
              {...form.register('description')}
              rows={3}
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all resize-none"
              placeholder="Enter project description"
            />
            {form.formState.errors.description && (
              <p className="mt-1.5 text-xs text-destructive">{form.formState.errors.description.message}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-1.5">
              Status
            </label>
            <select
              id="status"
              {...form.register('status')}
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all cursor-pointer"
            >
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
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
