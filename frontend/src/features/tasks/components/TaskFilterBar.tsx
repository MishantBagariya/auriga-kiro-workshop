import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Select } from '../../../components/ui/Select';
import { useDebounce } from '../../../hooks/useDebounce';
import { useProjectOptions } from '../hooks/useProjectOptions';
import { TASK_PRIORITIES, TASK_STATUSES } from '../../../types/task';
import { taskPriorityLabels, taskStatusLabels } from '../../../lib/labels';
import type { TaskFilters, SortBy, SortOrder } from '../types';

interface TaskFilterBarProps {
  filters: TaskFilters;
  onChange: (key: string, value: string | undefined) => void;
}

const sortOptions: { value: SortBy; label: string }[] = [
  { value: 'createdAt', label: 'Created date' },
  { value: 'updatedAt', label: 'Updated date' },
  { value: 'dueDate', label: 'Due date' },
  { value: 'priority', label: 'Priority' },
];

export function TaskFilterBar({ filters, onChange }: TaskFilterBarProps) {
  const { data: projects } = useProjectOptions();
  const [searchInput, setSearchInput] = useState(filters.search ?? '');
  const debouncedSearch = useDebounce(searchInput);

  useEffect(() => {
    onChange('search', debouncedSearch || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-2">
      <div className="flex-1">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            type="search"
            aria-label="Search tasks by title"
            placeholder="Search tasks by title…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <Select
        aria-label="Filter by project"
        value={filters.projectId ?? ''}
        onChange={(e) => onChange('projectId', e.target.value || undefined)}
      >
        <option value="">All Projects</option>
        {projects?.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </Select>
      <Select
        aria-label="Filter by status"
        value={filters.status ?? ''}
        onChange={(e) => onChange('status', e.target.value || undefined)}
      >
        <option value="">All Statuses</option>
        {TASK_STATUSES.map((status) => (
          <option key={status} value={status}>
            {taskStatusLabels[status]}
          </option>
        ))}
      </Select>
      <Select
        aria-label="Filter by priority"
        value={filters.priority ?? ''}
        onChange={(e) => onChange('priority', e.target.value || undefined)}
      >
        <option value="">All Priorities</option>
        {TASK_PRIORITIES.map((priority) => (
          <option key={priority} value={priority}>
            {taskPriorityLabels[priority]}
          </option>
        ))}
      </Select>
      <Select
        aria-label="Sort by"
        value={filters.sortBy ?? 'createdAt'}
        onChange={(e) => onChange('sortBy', e.target.value)}
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            Sort: {opt.label}
          </option>
        ))}
      </Select>
      <Select
        aria-label="Sort order"
        value={filters.sortOrder ?? 'desc'}
        onChange={(e) => onChange('sortOrder', e.target.value as SortOrder)}
      >
        <option value="desc">Descending</option>
        <option value="asc">Ascending</option>
      </Select>
    </div>
  );
}
