import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { ErrorState } from '../../../components/ui/ErrorState';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useProjects } from '../hooks/useProjects';
import { ProjectCard } from './ProjectCard';
import { ProjectFormDialog } from './ProjectFormDialog';

export function ProjectList() {
  const { data: projects, isLoading, isError, refetch } = useProjects();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Project
        </Button>
      </div>

      {isLoading && <Spinner label="Loading projects" />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && projects && projects.length === 0 && (
        <EmptyState
          title="No projects yet"
          description="Create your first project to start organizing tasks."
          action={<Button onClick={() => setIsCreateOpen(true)}>Create Project</Button>}
        />
      )}
      {!isLoading && !isError && projects && projects.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <ProjectFormDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
