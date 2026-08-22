import { Link } from "react-router-dom";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { formatDate, isOverdue } from "../../lib/formatDate";
import { cn } from "../../lib/cn";
import type { Task } from "../../types";

export function TaskRow({ task }: { task: Task }) {
  const overdue = isOverdue(task.dueDate, task.status);
  return (
    <Link
      to={`/tasks/${task.id}`}
      className="flex flex-col gap-2 border-b border-slate-100 px-4 py-3 last:border-b-0 hover:bg-slate-50 md:flex-row md:items-center md:gap-4"
    >
      <span className="flex-1 truncate text-sm font-medium text-slate-900">{task.title}</span>
      <span className="text-xs text-slate-500 md:w-40 md:truncate">{task.project.name}</span>
      <span className="md:w-32">
        <StatusBadge status={task.status} />
      </span>
      <span className="md:w-24">
        <PriorityBadge priority={task.priority} />
      </span>
      <span className={cn("text-xs md:w-24", overdue ? "font-medium text-red-600" : "text-slate-500")}>
        {formatDate(task.dueDate)}
      </span>
    </Link>
  );
}
