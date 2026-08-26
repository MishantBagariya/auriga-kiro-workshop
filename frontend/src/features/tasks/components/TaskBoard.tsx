import { TASK_STATUSES } from '../../../types/task';
import type { Task, TaskStatus } from '../../../types/task';
import { TaskBoardColumn } from './TaskBoardColumn';
import { useUpdateTaskStatus } from '../hooks/useUpdateTaskStatus';
import { useToast } from '../../../hooks/useToast';
import type { ApiError } from '../../../types/api';

/**
 * Three status columns, horizontally scrollable on narrow screens so
 * the board stays usable on mobile without squeezing columns
 * (product.md).
 */
export function TaskBoard({ tasks }: { tasks: Task[] }) {
  const updateStatus = useUpdateTaskStatus();
  const { showToast } = useToast();

  const byStatus = (status: TaskStatus) => tasks.filter((t) => t.status === status);

  const handleDrop = (taskId: string, status: TaskStatus) => {
    updateStatus.mutate(
      { id: taskId, status },
      {
        onSuccess: () => showToast('Task status updated'),
        onError: (error) => showToast((error as ApiError).message, 'error'),
      },
    );
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {TASK_STATUSES.map((status) => (
        <TaskBoardColumn key={status} status={status} tasks={byStatus(status)} onDrop={handleDrop} />
      ))}
    </div>
  );
}
