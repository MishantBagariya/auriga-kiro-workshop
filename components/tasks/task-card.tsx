"use client";

import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { PriorityBadge } from "@/components/tasks/task-badges";
import { TaskStatusSelect } from "@/components/tasks/task-status-select";
import type { TaskStatus, TaskWithProject } from "@/types";

interface TaskCardProps {
  task: TaskWithProject;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  isUpdating?: boolean;
}

export function TaskCard({ task, onStatusChange, isUpdating }: TaskCardProps) {
  return (
    <div className="glass rounded-lg p-3 transition-shadow hover:shadow-md">
      <p className="text-sm font-medium leading-snug text-foreground">
        {task.title}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{task.project.name}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <PriorityBadge priority={task.priority} />
        {task.dueDate && (
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {format(new Date(task.dueDate), "MMM d")}
          </span>
        )}
      </div>
      <div className="mt-2 border-t border-border pt-2">
        <TaskStatusSelect
          value={task.status}
          onChange={(status) => onStatusChange(task.id, status)}
          disabled={isUpdating}
        />
      </div>
    </div>
  );
}
