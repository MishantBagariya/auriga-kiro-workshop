"use client";

import { Suspense, useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Plus, ListTodo, SearchX, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTasks, useCreateTask } from "@/hooks/use-tasks";
import { useProjects } from "@/hooks/use-projects";
import { TaskList } from "@/components/tasks/task-list";
import { TaskForm } from "@/components/tasks/task-form";
import { TaskDetailPanel } from "@/components/tasks/task-detail-panel";
import { TaskSearch } from "@/components/tasks/task-search";
import { TaskFilters } from "@/components/tasks/task-filters";
import { TaskSort } from "@/components/tasks/task-sort";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorMessage } from "@/components/shared/error-message";
import { EmptyState } from "@/components/shared/empty-state";
import type { CreateTaskInput } from "@/lib/validations/task";
import type {
  TaskListParams,
  TaskStatus,
  TaskPriority,
  TaskSortField,
  SortOrder,
} from "@/types";

export default function TasksPage() {
  return (
    <Suspense fallback={<LoadingSpinner className="flex-1 p-6" label="Loading tasks" />}>
      <TasksContent />
    </Suspense>
  );
}

function TasksContent() {
  const searchParams = useSearchParams();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
    searchParams.get("selected"),
  );

  // Search / filter / sort state.
  const [search, setSearch] = useState("");
  const [projectId, setProjectId] = useState<string | undefined>(
    searchParams.get("projectId") ?? undefined,
  );
  const [status, setStatus] = useState<TaskStatus | undefined>();
  const [priority, setPriority] = useState<TaskPriority | undefined>();
  const [sortBy, setSortBy] = useState<TaskSortField>("createdAt");
  const [order, setOrder] = useState<SortOrder>("desc");

  const params: TaskListParams = {
    search: search || undefined,
    projectId,
    status,
    priority,
    sortBy,
    order,
  };

  const { data, isLoading, isError, refetch } = useTasks(params);
  const { data: projects } = useProjects();
  const createTask = useCreateTask();

  async function handleCreate(taskData: CreateTaskInput) {
    await createTask.mutateAsync(taskData);
    toast.success("Task created successfully");
  }

  const handleOrderToggle = useCallback(() => {
    setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  }, []);

  const hasFilters = !!(search || projectId || status || priority);

  return (
    <div className="flex flex-1 gap-4 p-6">
      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Tasks</h1>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            New Task
          </Button>
        </div>

        {/* Search + Filters + Sort toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TaskSearch value={search} onChange={setSearch} />
          <TaskSort
            sortBy={sortBy}
            order={order}
            onSortByChange={setSortBy}
            onOrderToggle={handleOrderToggle}
          />
        </div>

        {projects && (
          <TaskFilters
            projects={projects}
            projectId={projectId}
            status={status}
            priority={priority}
            onProjectChange={setProjectId}
            onStatusChange={setStatus}
            onPriorityChange={setPriority}
          />
        )}

        {/* Content area */}
        {isLoading && <LoadingSpinner label="Loading tasks" />}

        {isError && (
          <ErrorMessage message="Failed to load tasks." retry={() => refetch()} />
        )}

        {data && data.items.length === 0 && !hasFilters && (
          <EmptyState
            icon={<ListTodo className="h-10 w-10" />}
            title="No tasks yet"
            description="Create your first task to get started."
            action={
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="mr-1 h-4 w-4" />
                Create Task
              </Button>
            }
          />
        )}

        {data && data.items.length === 0 && hasFilters && search && (
          <EmptyState
            icon={<SearchX className="h-10 w-10" />}
            title="No results found"
            description={`No tasks match "${search}". Try a different search term.`}
          />
        )}

        {data && data.items.length === 0 && hasFilters && !search && (
          <EmptyState
            icon={<Filter className="h-10 w-10" />}
            title="No matching tasks"
            description="No tasks match the selected filters. Try adjusting your filters."
          />
        )}

        {data && data.items.length > 0 && (
          <>
            <TaskList tasks={data.items} />
            {data.totalPages > 1 && (
              <p className="text-center text-sm text-muted-foreground">
                Showing page {data.page} of {data.totalPages} ({data.total} tasks)
              </p>
            )}
          </>
        )}
      </div>

      {/* Detail panel (right side on desktop) */}
      {selectedTaskId && (
        <div className="hidden w-96 shrink-0 lg:block">
          <TaskDetailPanel
            taskId={selectedTaskId}
            onClose={() => setSelectedTaskId(null)}
          />
        </div>
      )}

      {/* Create dialog */}
      {projects && (
        <TaskForm
          open={formOpen}
          onOpenChange={setFormOpen}
          projects={projects}
          defaultValues={
            projectId ? { projectId } : undefined
          }
          onSubmit={handleCreate}
          title="Create Task"
          submitLabel="Create"
        />
      )}
    </div>
  );
}
