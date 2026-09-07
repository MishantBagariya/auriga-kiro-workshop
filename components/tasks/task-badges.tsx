import {
  Circle,
  Clock,
  CheckCircle2,
  ArrowDown,
  Minus,
  ArrowUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskPriority, TaskStatus } from "@/types";

// Jira-style status badges — minimal colored lozenges
const statusConfig: Record<
  TaskStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  todo: {
    label: "TO DO",
    icon: Circle,
    className: "bg-[#dfe1e6] text-[#44546f]",
  },
  in_progress: {
    label: "IN PROGRESS",
    icon: Clock,
    className: "bg-[#0c66e4] text-white",
  },
  completed: {
    label: "DONE",
    icon: CheckCircle2,
    className: "bg-[#1f845a] text-white",
  },
};

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}

// Jira-style priority icons — just the arrow/icon with color
const priorityConfig: Record<
  TaskPriority,
  { label: string; icon: React.ElementType; color: string }
> = {
  low: {
    label: "Low",
    icon: ArrowDown,
    color: "text-[#1f845a]",
  },
  medium: {
    label: "Medium",
    icon: Minus,
    color: "text-[#e2b203]",
  },
  high: {
    label: "High",
    icon: ArrowUp,
    color: "text-[#c9372c]",
  },
};

interface PriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  const Icon = config.icon;
  return (
    <span
      className={cn("inline-flex items-center gap-1", className)}
      title={`${config.label} priority`}
    >
      <Icon className={cn("h-4 w-4", config.color)} />
      <span className="text-xs text-muted-foreground">{config.label}</span>
    </span>
  );
}
