"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TASK_STATUSES,
  TASK_PRIORITIES,
  type TaskStatus,
  type TaskPriority,
  type ProjectWithCounts,
} from "@/types";

interface TaskFiltersProps {
  projects: ProjectWithCounts[];
  projectId: string | undefined;
  status: TaskStatus | undefined;
  priority: TaskPriority | undefined;
  onProjectChange: (value: string | undefined) => void;
  onStatusChange: (value: TaskStatus | undefined) => void;
  onPriorityChange: (value: TaskPriority | undefined) => void;
}

const statusLabels: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  completed: "Completed",
};

const priorityLabels: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export function TaskFilters({
  projects,
  projectId,
  status,
  priority,
  onProjectChange,
  onStatusChange,
  onPriorityChange,
}: TaskFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {/* Project filter */}
      <Select
        value={projectId ?? "__all"}
        onValueChange={(v) => onProjectChange(!v || v === "__all" ? undefined : v)}
      >
        <SelectTrigger className="w-[180px]" aria-label="Filter by project">
          <SelectValue placeholder="All Projects" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all">All Projects</SelectItem>
          {projects.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status filter */}
      <Select
        value={status ?? "__all"}
        onValueChange={(v) =>
          onStatusChange(v === "__all" ? undefined : (v as TaskStatus))
        }
      >
        <SelectTrigger className="w-[150px]" aria-label="Filter by status">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all">All Statuses</SelectItem>
          {TASK_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {statusLabels[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Priority filter */}
      <Select
        value={priority ?? "__all"}
        onValueChange={(v) =>
          onPriorityChange(v === "__all" ? undefined : (v as TaskPriority))
        }
      >
        <SelectTrigger className="w-[150px]" aria-label="Filter by priority">
          <SelectValue placeholder="All Priorities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all">All Priorities</SelectItem>
          {TASK_PRIORITIES.map((p) => (
            <SelectItem key={p} value={p}>
              {priorityLabels[p]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
