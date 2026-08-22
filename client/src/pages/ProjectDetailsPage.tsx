import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDeleteProject, useProjectQuery } from "../hooks/useProjects";
import { ProjectStatusBadge } from "../components/projects/ProjectStatusBadge";
import { ProjectFormDialog } from "../components/projects/ProjectFormDialog";
import { TaskFormDialog } from "../components/tasks/TaskFormDialog";
import { TaskList } from "../components/tasks/TaskList";
import { Button } from "../components/ui/Button";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";
import { useToast } from "../components/ui/ToastProvider";

export function ProjectDetailsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: project, isLoading, isError, refetch } = useProjectQuery(projectId);
  const deleteMutation = useDeleteProject();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [newTaskOpen, setNewTaskOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="space-y-4">
        <Link to="/projects" className="text-sm text-indigo-600 hover:underline">
          ← Back to projects
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          This project couldn't be found.{" "}
          <Button size="sm" variant="secondary" className="ml-2" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(project.id);
      toast.success("Project deleted");
      navigate("/projects");
    } catch {
      toast.error("Couldn't delete project. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <Link to="/projects" className="text-sm text-indigo-600 hover:underline">
        ← Back to projects
      </Link>

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900">{project.name}</h1>
            <ProjectStatusBadge status={project.status} />
          </div>
          {project.description && <p className="mt-2 max-w-2xl text-sm text-slate-500">{project.description}</p>}
          <p className="mt-2 text-sm text-slate-500">
            {project.completedTaskCount} / {project.taskCount} tasks completed
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="secondary" onClick={() => setEditOpen(true)}>
            Edit
          </Button>
          <Button variant="danger" onClick={() => setDeleteOpen(true)}>
            Delete
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Tasks</h2>
        <Button size="sm" onClick={() => setNewTaskOpen(true)}>
          New Task
        </Button>
      </div>

      {project.tasks.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          description="Create the first task for this project."
          actionLabel="New Task"
          onAction={() => setNewTaskOpen(true)}
        />
      ) : (
        <TaskList tasks={project.tasks.map((t) => ({ ...t, project: { id: project.id, name: project.name } }))} />
      )}

      <ProjectFormDialog open={editOpen} onClose={() => setEditOpen(false)} project={project} />
      <TaskFormDialog open={newTaskOpen} onClose={() => setNewTaskOpen(false)} lockedProjectId={project.id} />
      <ConfirmDialog
        open={deleteOpen}
        title="Delete project"
        description={`Delete "${project.name}" and all ${project.taskCount} of its tasks? This cannot be undone.`}
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  );
}
