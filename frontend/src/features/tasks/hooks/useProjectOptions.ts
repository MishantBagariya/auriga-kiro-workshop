import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/apiClient';
import { queryKeys } from '../../../lib/queryKeys';
import type { Project } from '../../../types/project';

/**
 * The task form needs a project dropdown. Rather than importing from
 * the projects feature (features never import from sibling features,
 * per architecture.md), this calls the shared apiClient directly and
 * keys the query the same as `useProjects`, so the two features share
 * one cache entry instead of duplicating the fetch.
 */
export function useProjectOptions() {
  return useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: async () => {
      const res = await apiClient.get<Project[]>('/projects');
      return res.data;
    },
  });
}
