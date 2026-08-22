import { Link } from "react-router-dom";
import { Card } from "../ui/Card";
import { PriorityBadge } from "../tasks/PriorityBadge";
import { EmptyState } from "../ui/EmptyState";
import { formatDate } from "../../lib/formatDate";
import type { Task } from "../../types";

export function UpcomingTasksList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return <EmptyState title="No upcoming due dates" description="Tasks with a due date coming up will show up here." />;
  }
  return (
    <Card className="divide-y divide-slate-100">
      {tasks.map((task) => (
        <Link
          key={task.id}
          to={`/tasks/${task.id}`}
          className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">{task.title}</p>
            <p className="truncate text-xs text-slate-500">{task.project.name}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <PriorityBadge priority={task.priority} />
            <span className="text-xs text-slate-500">{formatDate(task.dueDate)}</span>
          </div>
        </Link>
      ))}
    </Card>
  );
}
