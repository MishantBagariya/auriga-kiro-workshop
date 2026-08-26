import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { ErrorState } from '../../../components/ui/ErrorState';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useProject } from '../hooks/useProject';
import { useDeleteProject } from '../hooks/useDeleteProject';
import { ProjectStatusBadge } from './ProjectStatusBadge';
import { ProjectFormDialog } from './ProjectFormDialog';
import { useToast } from '../../../hooks/useToast';
import { useTasks } from '../../tasks/hooks/useTasks';
import { TaskRow } from '../../tasks/components/TaskRow';
import { TaskFormDialog } from '../../tasks/components/TaskFormDialog';
import type { ApiError } from '../../../types/api';

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data: project, isLoading, isError, refetch } = useProject(id);
  const { data: tasksResult, isLoading: tasksLoading } = useTasks({ projectId: id }, { enabled: !!id });
  const deleteProject = useDeleteProject();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  if (isLoading) return <Spinner label="Loading project" />;
  if (isError || !project) return <ErrorState onRetry={() => refetch()} />;

  const handleDelete = () => {
    deleteProject.mutate(project.id, {
      onSuccess: () => {
        showToast('Project deleted');
        navigate('/projects');
      },
      onError: (error) => showToast((error as ApiError).message, 'error'),
    });
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <ProjectStatusBadge status={project.status} />
          </div>
          {project.description && <p className="text-gray-500">{project.description}</p>}
          <p className="mt-2 text-sm text-gray-500">
            {project.completedTaskCount} / {project.taskCount} tasks completed
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsEditOpen(true)}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit
          </Button>
          <Button variant="danger" onClick={() => setIsDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete
          </Button>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
        <Button onClick={() => setIsCreateTaskOpen(true)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Task
        </Button>
      </div>

      {tasksLoading && <Spinner label="Loading tasks" />}
      {!tasksLoading && tasksResult && tasksResult.data.length === 0 && (
        <EmptyState
          title="No tasks yet"
          description="Create a task to start tracking work for this project."
          action={<Button onClick={() => setIsCreateTaskOpen(true)}>Create Task</Button>}
        />
      )}
      {!tasksLoading && tasksResult && tasksResult.data.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {tasksResult.data.map((task) => (
            <TaskRow key={task.id} task={task} showProject={false} />
          ))}
        </div>
      )}

      <ProjectFormDialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} project={project} />
      <TaskFormDialog isOpen={isCreateTaskOpen} onClose={() => setIsCreateTaskOpen(false)} defaultProjectId={project.id} />
      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Delete project"
        message={`Delete "${project.name}"? This will also delete ${project.taskCount} task${project.taskCount === 1 ? '' : 's'} in this project. This cannot be undone.`}
        isLoading={deleteProject.isPending}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  );
}
