import { useState } from "react";
import { useProjectsQuery } from "../hooks/useProjects";
import { ProjectCard } from "../components/projects/ProjectCard";
import { ProjectFormDialog } from "../components/projects/ProjectFormDialog";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";

export function ProjectsPage() {
  const { data: projects, isLoading, isError, refetch } = useProjectsQuery();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>
          <p className="mt-1 text-sm text-slate-500">Organize your work into projects.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>New Project</Button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Couldn't load projects.{" "}
          <Button size="sm" variant="secondary" className="ml-2" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {projects && projects.length === 0 && (
        <EmptyState
          title="No projects yet"
          description="Create your first project to start organizing tasks."
          actionLabel="New Project"
          onAction={() => setCreateOpen(true)}
        />
      )}

      {projects && projects.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <ProjectFormDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
