import { Link } from 'react-router-dom';
import { CalendarClock } from 'lucide-react';
import { TaskStatusBadge } from './TaskStatusBadge';
import { TaskPriorityBadge } from './TaskPriorityBadge';
import { formatDate, isOverdue } from '../../../lib/format';
import type { Task } from '../../../types/task';

interface TaskRowProps {
  task: Task;
  showProject?: boolean;
}

export function TaskRow({ task, showProject = true }: TaskRowProps) {
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <Link
      to={`/tasks/${task.id}`}
      className="flex flex-col gap-2 border-b border-gray-100 px-4 py-3 last:border-b-0 hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <p className="truncate font-medium text-gray-900">{task.title}</p>
        {showProject && task.project && <p className="text-sm text-gray-500">{task.project.name}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <TaskStatusBadge status={task.status} />
        <TaskPriorityBadge priority={task.priority} />
        {task.dueDate && (
          <span className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-600' : 'text-gray-500'}`}>
            <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>
    </Link>
  );
}
