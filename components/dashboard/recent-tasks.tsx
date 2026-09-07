import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { ListTodo } from "lucide-react";
import type { TaskWithProject } from "@/types";
import { PriorityBadge, StatusBadge } from "@/components/tasks/task-badges";

interface RecentTasksProps {
  tasks: TaskWithProject[];
}

export function RecentTasks({ tasks }: RecentTasksProps) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={<ListTodo className="h-8 w-8" />}
        title="No recent tasks"
        description="Tasks you create or update will appear here."
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
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
