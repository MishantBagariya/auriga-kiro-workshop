import { useSearchParams } from 'react-router-dom';
import type { SortBy, SortOrder, TaskFilters, ViewMode } from '../types';
import type { TaskPriority, TaskStatus } from '../../../types/task';

/**
 * Reads and writes task filter, search, sort, and view-mode state to
 * the URL, per architecture.md's state ownership table. This is the
 * only place that knows the URL param names.
 */
export function useTaskFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: TaskFilters = {
    search: searchParams.get('search') || undefined,
    projectId: searchParams.get('projectId') || undefined,
    status: (searchParams.get('status') as TaskStatus) || undefined,
    priority: (searchParams.get('priority') as TaskPriority) || undefined,
    sortBy: (searchParams.get('sortBy') as SortBy) || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') as SortOrder) || 'desc',
  };

  const viewMode: ViewMode = (searchParams.get('view') as ViewMode) || 'list';

  function updateFilter(key: string, value: string | undefined) {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  }

  function setViewMode(mode: ViewMode) {
    updateFilter('view', mode === 'list' ? undefined : mode);
  }

  return { filters, viewMode, updateFilter, setViewMode };
}
