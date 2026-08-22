import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTasksQuery } from "../hooks/useTasks";
import { useProjectsQuery } from "../hooks/useProjects";
import { TaskFiltersBar } from "../components/tasks/TaskFiltersBar";
import { TaskList } from "../components/tasks/TaskList";
import { KanbanBoard } from "../components/board/KanbanBoard";
import { ViewToggle } from "../components/tasks/ViewToggle";
import { TaskFormDialog } from "../components/tasks/TaskFormDialog";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";
import type { SortOrder, TaskSortField, TaskStatus, TaskPriority } from "../types";

export function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [newTaskOpen, setNewTaskOpen] = useState(false);

  const view = (searchParams.get("view") as "list" | "board") || "list";
  const search = searchParams.get("search") ?? "";
  const projectId = searchParams.get("project") ?? "";
  const status = (searchParams.get("status") as TaskStatus) || "";
  const priority = (searchParams.get("priority") as TaskPriority) || "";
  const sortBy = (searchParams.get("sortBy") as TaskSortField) || "createdDate";
  const sortOrder = (searchParams.get("sortOrder") as SortOrder) || "desc";

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  const { data: projects } = useProjectsQuery();
  const { data: tasks, isLoading, isError, refetch } = useTasksQuery({
    search: search || undefined,
    projectId: projectId || undefined,
    status: status || undefined,
    priority: priority || undefined,
    sortBy,
    sortOrder,
  });

  const filtersActive = !!(search || projectId || status || priority);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Tasks</h1>
          <p className="mt-1 text-sm text-slate-500">All tasks across every project.</p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle view={view} onChange={(v) => setParam("view", v)} />
          <Button onClick={() => setNewTaskOpen(true)}>New Task</Button>
        </div>
      </div>

      <TaskFiltersBar
        search={search}
        onSearchChange={(v) => setParam("search", v)}
        projectId={projectId}
        onProjectChange={(v) => setParam("project", v)}
        status={status}
        onStatusChange={(v) => setParam("status", v)}
        priority={priority}
        onPriorityChange={(v) => setParam("priority", v)}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(nextSortBy, nextSortOrder) => {
          const next = new URLSearchParams(searchParams);
          next.set("sortBy", nextSortBy);
          next.set("sortOrder", nextSortOrder);
          setSearchParams(next, { replace: true });
        }}
        projects={projects}
      />

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Couldn't load tasks.{" "}
          <Button size="sm" variant="secondary" className="ml-2" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {tasks && tasks.length === 0 && !filtersActive && (
        <EmptyState
          title="No tasks yet"
          description="Create your first task to get started."
          actionLabel="New Task"
          onAction={() => setNewTaskOpen(true)}
        />
      )}

      {tasks && tasks.length === 0 && filtersActive && (
        <EmptyState
          title="No matching tasks"
          description="Try adjusting your search or filters."
        />
      )}

      {tasks && tasks.length > 0 && view === "list" && <TaskList tasks={tasks} />}
      {tasks && tasks.length > 0 && view === "board" && <KanbanBoard tasks={tasks} />}

      <TaskFormDialog open={newTaskOpen} onClose={() => setNewTaskOpen(false)} />
    </div>
  );
}
