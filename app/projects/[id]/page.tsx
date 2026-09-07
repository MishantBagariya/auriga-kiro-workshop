"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProject, useUpdateProject, useDeleteProject } from "@/hooks/use-projects";
import { ProjectForm } from "@/components/projects/project-form";
import { ProjectDeleteDialog } from "@/components/projects/project-delete-dialog";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorMessage } from "@/components/shared/error-message";
import { StatusBadge, PriorityBadge } from "@/components/tasks/task-badges";
import { EmptyState } from "@/components/shared/empty-state";
import type { CreateProjectInput } from "@/lib/validations/project";
import type { TaskStatus, TaskPriority } from "@/types";
import Link from "next/link";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: project, isLoading, isError, refetch } = useProject(id);
  const updateProject = useUpdateProject(id);
  const deleteProject = useDeleteProject(id);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function handleUpdate(data: CreateProjectInput) {
    await updateProject.mutateAsync(data);
    toast.success("Project updated successfully");
  }

  async function handleDelete() {
    await deleteProject.mutateAsync();
    toast.success("Project deleted");
    router.push("/projects");
  }

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <LoadingSpinner label="Loading project" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="flex-1 p-6">
        <ErrorMessage
          message="Failed to load project."
          retry={() => refetch()}
        />
      </div>
    );
  }

  const statusStyles: Record<string, string> = {
    active: "bg-green-50 text-green-700 border-green-200",
    completed: "bg-blue-50 text-blue-700 border-blue-200",
    archived: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          {project.description && (
            <p className="mt-1 text-muted-foreground">{project.description}</p>
          )}
          <div className="mt-2 flex items-center gap-3">
            <Badge
              variant="outline"
              className={`capitalize ${statusStyles[project.status]}`}
            >
              {project.status}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {project.completedTasks}/{project.totalTasks} tasks completed
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="mr-1 h-3 w-3" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-1 h-3 w-3" />
            Delete
          </Button>
        </div>
      </div>

      {/* Task list */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Tasks</h2>
          <Link
            href={`/tasks?projectId=${project.id}`}
            className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="mr-1 h-3 w-3" />
            New Task
          </Link>
        </div>

        {project.tasks.length === 0 ? (
          <EmptyState
            title="No tasks yet"
            description="Create a task to start tracking work in this project."
          />
        ) : (
          <div className="space-y-2">
            {project.tasks.map((task) => (
              <Card
                key={task.id}
                className="flex items-center justify-between gap-4 p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{task.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={task.status as TaskStatus} />
                  <PriorityBadge priority={task.priority as TaskPriority} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Edit dialog */}
      <ProjectForm
        open={editOpen}
        onOpenChange={setEditOpen}
        defaultValues={{
          name: project.name,
          description: project.description ?? "",
          status: project.status,
        }}
        onSubmit={handleUpdate}
        title="Edit Project"
        submitLabel="Save"
      />

      {/* Delete dialog */}
      <ProjectDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        projectName={project.name}
        loading={deleteProject.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
