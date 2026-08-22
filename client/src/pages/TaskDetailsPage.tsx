import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDeleteTask, useTaskQuery, useUpdateTaskStatus } from "../hooks/useTasks";
import { PriorityBadge } from "../components/tasks/PriorityBadge";
import { TaskFormDialog } from "../components/tasks/TaskFormDialog";
import { Button } from "../components/ui/Button";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Select } from "../components/ui/Select";
import { Skeleton } from "../components/ui/Skeleton";
import { useToast } from "../components/ui/ToastProvider";
import { formatDate, formatDateTime } from "../lib/formatDate";
import { TASK_STATUSES, type TaskStatus } from "../types";

export function TaskDetailsPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: task, isLoading, isError, refetch } = useTaskQuery(taskId);
  const deleteMutation = useDeleteTask();
  const updateStatus = useUpdateTaskStatus();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full max-w-2xl" />
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div className="space-y-4">
        <Link to="/tasks" className="text-sm text-indigo-600 hover:underline">
          ← Back to tasks
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          This task couldn't be found.{" "}
          <Button size="sm" variant="secondary" className="ml-2" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({ id: task.id, projectId: task.projectId });
      toast.success("Task deleted");
      navigate("/tasks");
    } catch {
      toast.error("Couldn't delete task. Please try again.");
    }
  };

  const handleStatusChange = (status: TaskStatus) => {
    updateStatus.mutate(
      { id: task.id, status },
      {
        onSuccess: () => toast.success("Task status updated"),
        onError: () => toast.error("Couldn't update task status. Please try again."),
      }
    );
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Link to="/tasks" className="text-sm text-indigo-600 hover:underline">
        ← Back to tasks
      </Link>

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{task.title}</h1>
          <Link to={`/projects/${task.projectId}`} className="mt-1 inline-block text-sm text-indigo-600 hover:underline">
            {task.project.name}
          </Link>
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

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Status</span>
          <Select
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
            className="!w-auto"
          >
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Priority</span>
          <PriorityBadge priority={task.priority} />
        </div>
      </div>

      {task.description && (
        <div>
          <h2 className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Description</h2>
          <p className="whitespace-pre-wrap text-sm text-slate-700">{task.description}</p>
        </div>
      )}

      {task.labels.length > 0 && (
        <div>
          <h2 className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Labels</h2>
          <div className="flex flex-wrap gap-1.5">
            {task.labels.map((label) => (
              <span key={label} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      <dl className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Due date</dt>
          <dd className="mt-0.5 text-slate-700">{formatDate(task.dueDate)}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Created</dt>
          <dd className="mt-0.5 text-slate-700">{formatDateTime(task.createdDate)}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Updated</dt>
          <dd className="mt-0.5 text-slate-700">{formatDateTime(task.updatedDate)}</dd>
        </div>
      </dl>

      <TaskFormDialog open={editOpen} onClose={() => setEditOpen(false)} task={task} />
      <ConfirmDialog
        open={deleteOpen}
        title="Delete task"
        description={`Delete "${task.title}"? This cannot be undone.`}
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  );
}
