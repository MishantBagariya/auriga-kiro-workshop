import { Link } from 'react-router-dom';
import { CalendarClock } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { TaskPriorityBadge } from './TaskPriorityBadge';
import { formatDate, isOverdue } from '../../../lib/format';
import type { Task } from '../../../types/task';

interface TaskCardProps {
  task: Task;
  draggable?: boolean;
  onDragStart?: (task: Task) => void;
}

export function TaskCard({ task, draggable, onDragStart }: TaskCardProps) {
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <Card
      className="mb-2 cursor-grab active:cursor-grabbing"
      draggable={draggable}
      onDragStart={() => onDragStart?.(task)}
    >
      <Link to={`/tasks/${task.id}`} className="block">
        <p className="mb-2 font-medium text-gray-900">{task.title}</p>
        <div className="mb-2 flex items-center justify-between">
          <TaskPriorityBadge priority={task.priority} />
          {task.dueDate && (
            <span className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-600' : 'text-gray-500'}`}>
              <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>
        {task.project && <p className="text-xs text-gray-400">{task.project.name}</p>}
      </Link>
    </Card>
  );
}
