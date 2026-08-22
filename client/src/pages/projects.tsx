import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus, FolderOpen, AlertCircle, Trash2, Pencil, ArrowRight } from 'lucide-react'
import { api } from '@/lib/api'
import { cn, getStatusColor, getStatusLabel } from '@/lib/utils'
import { ProjectFormDialog } from '@/components/projects/project-form-dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import type { Project } from 'shared'

export function ProjectsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [deleteProject, setDeleteProject] = useState<Project | null>(null)

  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get<Project[]>('/projects'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/projects/${id}`),
    onSuccess: () => {
      toast.success('Project deleted')
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setDeleteProject(null)
    },
    onError: () => {
      toast.error('Failed to delete project')
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-9 w-36 animate-pulse rounded-lg bg-muted" />
          <div className="h-10 w-36 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-xl border bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 animate-fade-in">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <p className="text-sm text-destructive">Failed to load projects</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage your projects</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          Create Project
        </button>
      </div>

      {projects && projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-16 animate-fade-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <FolderOpen className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <h3 className="mt-5 text-lg font-semibold">No projects yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Create your first project to get started</p>
          <button
            onClick={() => setCreateOpen(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
          >
            <Plus className="h-4 w-4" />
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects?.map((project, i) => {
            const taskCount = project.taskCount || project._count?.tasks || 0
            const completedCount = project.completedTaskCount || 0
            const progress = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0

            return (
              <div
                key={project.id}
                className="group relative overflow-hidden rounded-xl border bg-card p-5 transition-all duration-300 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5 cursor-pointer animate-slide-up"
                style={{ animationDelay: `${i * 50}ms` }}
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-semibold tracking-tight">{project.name}</h3>
                    <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
                      {project.description || 'No description'}
                    </p>
                  </div>
                  <span className={cn('ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold', getStatusColor(project.status))}>
                    {getStatusLabel(project.status)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      <span className="font-semibold text-foreground">{completedCount}</span> / {taskCount} tasks
                    </span>
                    <span className="font-semibold text-muted-foreground">{progress}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Actions (show on hover) */}
                <div className="absolute right-3 top-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditProject(project)
                    }}
                    className="rounded-lg bg-white p-1.5 shadow-sm border hover:bg-accent transition-colors"
                    aria-label="Edit project"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteProject(project)
                    }}
                    className="rounded-lg bg-white p-1.5 shadow-sm border hover:bg-destructive/10 text-destructive transition-colors"
                    aria-label="Delete project"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Dialogs */}
      <ProjectFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ProjectFormDialog
        open={!!editProject}
        onOpenChange={(open) => !open && setEditProject(null)}
        project={editProject || undefined}
      />
      <ConfirmDialog
        open={!!deleteProject}
        onOpenChange={(open) => !open && setDeleteProject(null)}
        title="Delete Project"
        description={`Are you sure you want to delete "${deleteProject?.name}"? This will also delete all tasks associated with this project. This action cannot be undone.`}
        onConfirm={() => deleteProject && deleteMutation.mutate(deleteProject.id)}
        loading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  )
}
