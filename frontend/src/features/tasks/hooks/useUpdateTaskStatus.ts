import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';
import { updateTaskStatus } from '../api/tasks.api';
import type { TaskStatus } from '../../../types/task';

/**
 * Powers both the status dropdown on task details and the drag/drop
 * (or select-to-move) interaction on the Kanban board. Invalidates
 * everything required for Flow 4: task list, board, project stats,
 * and dashboard stats (architecture.md).
 */
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) => updateTaskStatus(id, status),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(task.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(task.projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary });
    },
  });
}
