import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { ErrorState } from '../../../components/ui/ErrorState';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useTasks } from '../hooks/useTasks';
import { useTaskFilters } from '../hooks/useTaskFilters';
import { TaskFilterBar } from './TaskFilterBar';
import { ViewToggle } from './ViewToggle';
import { TaskRow } from './TaskRow';
import { TaskBoard } from './TaskBoard';
import { TaskFormDialog } from './TaskFormDialog';

function hasActiveFilters(filters: { search?: string; projectId?: string; status?: string; priority?: string }) {
  return !!(filters.search || filters.projectId || filters.status || filters.priority);
}

export function TaskList() {
  const { filters, viewMode, updateFilter, setViewMode } = useTaskFilters();
  const { data: result, isLoading, isError, refetch } = useTasks(filters);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const tasks = result?.data ?? [];
  const isEmpty = !isLoading && !isError && tasks.length === 0;
  const filtersActive = hasActiveFilters(filters);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <div className="flex items-center gap-2">
          <ViewToggle value={viewMode} onChange={setViewMode} />
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Task
          </Button>
        </div>
      </div>

      <TaskFilterBar filters={filters} onChange={updateFilter} />

      {isLoading && <Spinner label="Loading tasks" />}
      {isError && <ErrorState onRetry={() => refetch()} />}

      {isEmpty && !filtersActive && (
        <EmptyState
          title="No tasks yet"
          description="Create your first task to start tracking work."
          action={<Button onClick={() => setIsCreateOpen(true)}>Create Task</Button>}
        />
      )}

      {isEmpty && filtersActive && !filters.search && (
        <EmptyState title="No tasks match these filters" description="Try adjusting or clearing your filters." />
      )}

      {isEmpty && filtersActive && filters.search && (
        <EmptyState title="No tasks match your search" description="Try a different search term." />
      )}

      {!isLoading && !isError && tasks.length > 0 && viewMode === 'list' && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </div>
      )}

      {!isLoading && !isError && tasks.length > 0 && viewMode === 'board' && <TaskBoard tasks={tasks} />}

      <TaskFormDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
