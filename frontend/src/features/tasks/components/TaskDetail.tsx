import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Spinner } from '../../../components/ui/Spinner';
import { ErrorState } from '../../../components/ui/ErrorState';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { useTask } from '../hooks/useTask';
import { useDeleteTask } from '../hooks/useDeleteTask';
import { useUpdateTaskStatus } from '../hooks/useUpdateTaskStatus';
import { useToast } from '../../../hooks/useToast';
import { TaskStatusBadge } from './TaskStatusBadge';
import { TaskPriorityBadge } from './TaskPriorityBadge';
import { TaskFormDialog } from './TaskFormDialog';
import { TASK_STATUSES } from '../../../types/task';
import { taskStatusLabels } from '../../../lib/labels';
import { formatDate } from '../../../lib/format';
import type { TaskStatus } from '../../../types/task';
import type { ApiError } from '../../../types/api';

export function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data: task, isLoading, isError, refetch } = useTask(id);
  const deleteTask = useDeleteTask(task?.projectId);
  const updateStatus = useUpdateTaskStatus();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  if (isLoading) return <Spinner label="Loading task" />;
  if (isError || !task) return <ErrorState onRetry={() => refetch()} />;

  const handleStatusChange = (status: TaskStatus) => {
    updateStatus.mutate(
      { id: task.id, status },
      {
        onSuccess: () => showToast('Task status updated'),
        onError: (error) => showToast((error as ApiError).message, 'error'),
      },
    );
  };

  const handleDelete = () => {
    deleteTask.mutate(task.id, {
      onSuccess: () => {
        showToast('Task deleted');
        navigate('/tasks');
      },
      onError: (error) => showToast((error as ApiError).message, 'error'),
    });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
          {task.project && <p className="text-gray-500">{task.project.name}</p>}
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

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        {task.description && <p className="mb-4 text-gray-700">{task.description}</p>}

        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="mb-1 font-medium text-gray-500">Status</dt>
            <dd>
              <Select
                aria-label="Change task status"
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                disabled={updateStatus.isPending}
              >
                {TASK_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {taskStatusLabels[status]}
                  </option>
                ))}
              </Select>
            </dd>
          </div>
          <div>
            <dt className="mb-1 font-medium text-gray-500">Priority</dt>
            <dd>
              <TaskPriorityBadge priority={task.priority} />
            </dd>
          </div>
          <div>
            <dt className="mb-1 font-medium text-gray-500">Due Date</dt>
            <dd className="text-gray-900">{formatDate(task.dueDate)}</dd>
          </div>
          <div>
            <dt className="mb-1 font-medium text-gray-500">Current Status</dt>
            <dd>
              <TaskStatusBadge status={task.status} />
            </dd>
          </div>
          {task.labels.length > 0 && (
            <div className="col-span-2">
              <dt className="mb-1 font-medium text-gray-500">Labels</dt>
              <dd className="flex flex-wrap gap-1">
                {task.labels.map((label) => (
                  <span key={label} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                    {label}
                  </span>
                ))}
              </dd>
            </div>
          )}
          <div>
            <dt className="mb-1 font-medium text-gray-500">Created</dt>
            <dd className="text-gray-900">{formatDate(task.createdAt)}</dd>
          </div>
          <div>
            <dt className="mb-1 font-medium text-gray-500">Updated</dt>
            <dd className="text-gray-900">{formatDate(task.updatedAt)}</dd>
          </div>
        </dl>
      </div>

      <TaskFormDialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} task={task} />
      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Delete task"
        message={`Delete "${task.title}"? This cannot be undone.`}
        isLoading={deleteTask.isPending}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  );
}
