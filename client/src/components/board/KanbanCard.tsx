import { Link } from "react-router-dom";
import { Card } from "../ui/Card";
import { PriorityBadge } from "../tasks/PriorityBadge";
import { Select } from "../ui/Select";
import { formatDate, isOverdue } from "../../lib/formatDate";
import { cn } from "../../lib/cn";
import { TASK_STATUSES, type Task, type TaskStatus } from "../../types";

interface KanbanCardProps {
  task: Task;
  onDragStart: (task: Task) => void;
  onStatusChange: (status: TaskStatus) => void;
}

export function KanbanCard({ task, onDragStart, onStatusChange }: KanbanCardProps) {
  const overdue = isOverdue(task.dueDate, task.status);
  return (
    <Card
      draggable
      onDragStart={() => onDragStart(task)}
      className="cursor-grab space-y-2 p-3 active:cursor-grabbing"
    >
      <Link to={`/tasks/${task.id}`} className="block text-sm font-medium text-slate-900 hover:underline">
        {task.title}
      </Link>
      <div className="flex items-center justify-between">
        <PriorityBadge priority={task.priority} />
        <span className={cn("text-xs", overdue ? "font-medium text-red-600" : "text-slate-500")}>
          {formatDate(task.dueDate)}
        </span>
      </div>
      <p className="truncate text-xs text-slate-500">{task.project.name}</p>
      <Select
        value={task.status}
        onChange={(e) => onStatusChange(e.target.value as TaskStatus)}
        className="!py-1 text-xs"
        aria-label={`Change status for ${task.title}`}
      >
        {TASK_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>
    </Card>
  );
}
