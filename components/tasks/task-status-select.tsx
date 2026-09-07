"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TASK_STATUSES, type TaskStatus } from "@/types";

const statusLabels: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  completed: "Completed",
};

interface TaskStatusSelectProps {
  value: TaskStatus;
  onChange: (status: TaskStatus) => void;
  disabled?: boolean;
}

export function TaskStatusSelect({
  value,
  onChange,
  disabled = false,
}: TaskStatusSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as TaskStatus)}
      disabled={disabled}
    >
      <SelectTrigger className="w-[140px]" aria-label="Change task status">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {TASK_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {statusLabels[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
