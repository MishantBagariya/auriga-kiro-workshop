"use client";

import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTask, useUpdateTask, useUpdateTaskStatus, useDeleteTask } from "@/hooks/use-tasks";
import { useProjects } from "@/hooks/use-projects";
import { TaskForm } from "@/components/tasks/task-form";
import { TaskDeleteDialog } from "@/components/tasks/task-delete-dialog";
import { TaskStatusSelect } from "@/components/tasks/task-status-select";
import { PriorityBadge } from "@/components/tasks/task-badges";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorMessage } from "@/components/shared/error-message";
import type { CreateTaskInput } from "@/lib/validations/task";
import type { TaskStatus } from "@/types";

interface TaskDetailPanelProps {
  taskId: string;
  onClose: () => void;
}

export function TaskDetailPanel({ taskId, onClose }: TaskDetailPanelProps) {
  const { data: task, isLoading, isError, refetch } = useTask(taskId);
  const { data: projects } = useProjects();
  const updateTask = useUpdateTask(taskId);
  const updateStatus = useUpdateTaskStatus(taskId);
  const deleteTask = useDeleteTask(taskId);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function handleUpdate(data: CreateTaskInput) {
    await updateTask.mutateAsync(data);
    toast.success("Task updated successfully");
  }

  async function handleStatusChange(status: TaskStatus) {
    await updateStatus.mutateAsync(status);
    toast.success("Task status updated");
  }

  async function handleDelete() {
    await deleteTask.mutateAsync();
    toast.success("Task deleted");
    onClose();
  }

  if (isLoading) {
    return (
      <Card className="p-4">
        <LoadingSpinner label="Loading task" />
      </Card>
    );
  }

  if (isError || !task) {
    return (
      <Card className="p-4">
        <ErrorMessage
          message="Failed to load task."
          retry={() => refetch()}
        />
      </Card>
    );
  }

  return (
    <Card className="rounded-lg border border-border bg-white flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-lg font-semibold">{task.title}</h2>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Status change */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Status:</span>
        <TaskStatusSelect
          value={task.status}
          onChange={handleStatusChange}
          disabled={updateStatus.isPending}
        />
      </div>

      <Separator />

      {/* Details */}
      <div className="space-y-3 text-sm">
        {task.description && (
          <div>
            <p className="font-medium text-muted-foreground">Description</p>
            <p className="mt-1 whitespace-pre-wrap">{task.description}</p>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="font-medium text-muted-foreground">Project:</span>
          <span>{task.project.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-medium text-muted-foreground">Priority:</span>
          <PriorityBadge priority={task.priority} />
        </div>

        {task.dueDate && (
          <div className="flex items-center gap-2">
            <span className="font-medium text-muted-foreground">Due:</span>
            <span>{format(new Date(task.dueDate), "MMMM d, yyyy")}</span>
          </div>
        )}

        {task.labels.length > 0 && (
          <div>
            <p className="font-medium text-muted-foreground">Labels</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {task.labels.map((label) => (
                <Badge key={label} variant="secondary" className="text-xs">
                  {label}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Created: {format(new Date(task.createdAt), "MMM d, yyyy")}</span>
          <span>·</span>
          <span>Updated: {format(new Date(task.updatedAt), "MMM d, yyyy")}</span>
        </div>
      </div>

      <Separator />

      {/* Actions */}
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

      {/* Edit dialog */}
      {projects && (
        <TaskForm
          open={editOpen}
          onOpenChange={setEditOpen}
          projects={projects}
          defaultValues={{
            title: task.title,
            description: task.description ?? "",
            projectId: task.projectId,
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate
              ? new Date(task.dueDate).toISOString().split("T")[0]
              : "",
            labels: task.labels.join(", "),
          }}
          onSubmit={handleUpdate}
          title="Edit Task"
          submitLabel="Save"
        />
      )}

      {/* Delete dialog */}
      <TaskDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        taskTitle={task.title}
        loading={deleteTask.isPending}
        onConfirm={handleDelete}
      />
    </Card>
  );
}
