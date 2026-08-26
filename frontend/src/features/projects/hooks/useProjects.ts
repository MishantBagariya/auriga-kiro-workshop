import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';
import { listProjects } from '../api/projects.api';

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: listProjects,
  });
}
