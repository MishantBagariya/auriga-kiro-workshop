import Link from "next/link";
import { format } from "date-fns";
import { StatusBadge, PriorityBadge } from "@/components/tasks/task-badges";
import type { TaskWithProject } from "@/types";

interface TaskListProps {
  tasks: TaskWithProject[];
}

export function TaskList({ tasks }: TaskListProps) {
  return (
    <div className="rounded-lg border border-border bg-white overflow-hidden">
      {/* Table header */}
      <div className="hidden items-center gap-4 border-b border-border bg-[#f7f8f9] px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:flex">
        <span className="w-20">Key</span>
        <span className="flex-1">Summary</span>
        <span className="w-28">Status</span>
        <span className="w-24">Priority</span>
        <span className="w-20">Due</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border">
        {tasks.map((task) => {
          const taskKey = `TF-${task.id.slice(0, 4).toUpperCase()}`;
          return (
            <Link key={task.id} href={`/tasks?selected=${task.id}`} className="block">
              <div className="flex items-center gap-4 px-4 py-2.5 transition-colors hover:bg-[#f7f8f9]">
                {/* Key */}
                <span className="hidden w-20 text-xs font-medium text-[#0c66e4] sm:block">
                  {taskKey}
                </span>

                {/* Summary + Project */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">
                    {task.title}
                  </p>
                  <p className="text-xs text-muted-foreground sm:hidden">
                    {task.project.name}
                  </p>
                </div>

                {/* Status */}
                <div className="hidden w-28 sm:block">
                  <StatusBadge status={task.status} />
                </div>

                {/* Priority */}
                <div className="w-24">
                  <PriorityBadge priority={task.priority} />
                </div>

                {/* Due date */}
                <div className="hidden w-20 sm:block">
                  {task.dueDate ? (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(task.dueDate), "MMM d")}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
