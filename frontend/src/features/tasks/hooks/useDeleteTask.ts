import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';
import { deleteTask } from '../api/tasks.api';

export function useDeleteTask(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary });
    },
  });
}
