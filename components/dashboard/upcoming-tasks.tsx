import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import type { TaskWithProject } from "@/types";
import { PriorityBadge } from "@/components/tasks/task-badges";

interface UpcomingTasksProps {
  tasks: TaskWithProject[];
}

export function UpcomingTasks({ tasks }: UpcomingTasksProps) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={<Calendar className="h-8 w-8" />}
        title="No upcoming tasks"
        description="Tasks with due dates in the next 7 days will appear here."
      />
    );
  }

  return (
    <div className="divide-y divide-border">
      {tasks.map((task) => (
        <Link key={task.id} href="/tasks" className="block">
          <div className="flex items-center gap-3 py-2.5 transition-colors hover:bg-[#f7f8f9] rounded px-2 -mx-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-foreground">
                {task.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {task.project.name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {task.dueDate && (
                <span className="text-xs text-muted-foreground">
                  {format(new Date(task.dueDate), "MMM d")}
                </span>
              )}
              <PriorityBadge priority={task.priority} />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
