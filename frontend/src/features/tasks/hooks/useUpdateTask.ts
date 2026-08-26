import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';
import { updateTask } from '../api/tasks.api';
import type { UpdateTaskInput } from '../types';

export function useUpdateTask(id: string, previousProjectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateTaskInput) => updateTask(id, input),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(task.projectId) });
      // If the task moved to a different project, the old project's
      // counts changed too (architecture.md's update-task row).
      if (previousProjectId && previousProjectId !== task.projectId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(previousProjectId) });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary });
    },
  });
}
