"use client";

import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useTasks, useCreateTask, useUpdateTaskStatus } from "@/hooks/use-tasks";
import { useProjects } from "@/hooks/use-projects";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorMessage } from "@/components/shared/error-message";
import { EmptyState } from "@/components/shared/empty-state";
import { TaskForm } from "@/components/tasks/task-form";
import { Button } from "@/components/ui/button";
import { Columns3, ListTodo } from "lucide-react";
import type { TaskStatus, TaskPriority, TaskWithProject } from "@/types";
import type { CreateTaskInput } from "@/lib/validations/task";
import { useState } from "react";

const COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: "todo", label: "TO DO", color: "#626f86" },
  { status: "in_progress", label: "IN PROGRESS", color: "#0c66e4" },
  { status: "completed", label: "DONE", color: "#1f845a" },
];

const PRIORITY_ICON: Record<TaskPriority, { color: string; symbol: string }> = {
  high: { color: "#c9372c", symbol: "↑" },
  medium: { color: "#e2b203", symbol: "=" },
  low: { color: "#1f845a", symbol: "↓" },
};

export default function BoardPage() {
  const { data, isLoading, isError, refetch } = useTasks({ pageSize: 100 });
  const { data: projects } = useProjects();
  const createTask = useCreateTask();
  const [formOpen, setFormOpen] = useState(false);

  async function handleCreate(taskData: CreateTaskInput) {
    await createTask.mutateAsync(taskData);
    toast.success("Task created");
  }

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <LoadingSpinner label="Loading board" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex-1 p-6">
        <ErrorMessage message="Failed to load tasks." retry={() => refetch()} />
      </div>
    );
  }

  // Group tasks by status
  const tasksByStatus: Record<TaskStatus, TaskWithProject[]> = {
    todo: [],
    in_progress: [],
    completed: [],
  };
  for (const task of data.items) {
    tasksByStatus[task.status]?.push(task);
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Board header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-2">
          <Columns3 className="h-4 w-4 text-muted-foreground" />
          <h1 className="text-base font-semibold text-foreground">Board</h1>
        </div>
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          Create
        </Button>
      </div>

      {/* Board columns */}
      {data.items.length === 0 ? (
        <div className="flex-1 p-6">
          <EmptyState
            icon={<ListTodo className="h-10 w-10" />}
            title="No tasks yet"
            description="Create tasks to see them on the board."
          />
        </div>
      ) : (
        <div className="flex flex-1 gap-3 overflow-x-auto p-4">
          {COLUMNS.map((col) => (
            <div
              key={col.status}
              className="flex w-[280px] min-w-[280px] shrink-0 flex-col rounded-lg bg-[#f7f8f9]"
            >
              {/* Column header */}
              <div className="flex items-center gap-2 px-3 py-3">
                <span
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: col.color }}
                >
                  {col.label}
                </span>
                <span className="rounded-full bg-[#e1e4e8] px-1.5 py-0.5 text-[10px] font-bold text-[#44546f]">
                  {tasksByStatus[col.status].length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2">
                {tasksByStatus[col.status].map((task) => (
                  <BoardCard key={task.id} task={task} />
                ))}

                {/* Create issue link at bottom */}
                <button
                  onClick={() => setFormOpen(true)}
                  className="flex items-center gap-1 rounded px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-[#e1e4e8]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create issue
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create task dialog */}
      {projects && (
        <TaskForm
          open={formOpen}
          onOpenChange={setFormOpen}
          projects={projects}
          onSubmit={handleCreate}
          title="Create Task"
          submitLabel="Create"
        />
      )}
    </div>
  );
}

// Individual board card — Jira style
function BoardCard({ task }: { task: TaskWithProject }) {
  const updateStatus = useUpdateTaskStatus(task.id);
  const priority = PRIORITY_ICON[task.priority];

  async function handleStatusChange(newStatus: TaskStatus) {
    try {
      await updateStatus.mutateAsync(newStatus);
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update");
    }
  }

  // Task ID (first 8 chars of UUID, uppercased)
  const taskKey = `TF-${task.id.slice(0, 4).toUpperCase()}`;

  return (
    <div className="group rounded-sm border border-[#e1e4e8] bg-white p-3 shadow-sm transition-shadow hover:shadow-md">
      {/* Task key */}
      <p className="text-xs font-medium text-[#0c66e4]">{taskKey}</p>

      {/* Title */}
      <p className="mt-1 text-sm font-normal text-foreground leading-snug">
        {task.title}
      </p>

      {/* Footer row: avatar + priority */}
      <div className="mt-3 flex items-center justify-between">
        {/* Avatar placeholder */}
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#6554c0] text-[10px] font-bold text-white">
          {task.project.name.charAt(0).toUpperCase()}
        </div>

        {/* Priority + Status indicator */}
        <div className="flex items-center gap-2">
          {/* Priority icon */}
          <span
            className="text-base font-bold leading-none"
            style={{ color: priority.color }}
            title={`${task.priority} priority`}
          >
            {priority.symbol}
          </span>

          {/* Done checkmark */}
          {task.status === "completed" && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1f845a]">
              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
          )}

          {/* In-progress dot */}
          {task.status === "in_progress" && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#0c66e4] bg-white">
              <span className="h-2 w-2 rounded-full bg-[#0c66e4]" />
            </span>
          )}

          {/* Priority label */}
          <span className="text-[11px] text-muted-foreground capitalize">
            {task.priority}
          </span>
        </div>
      </div>
    </div>
  );
}
