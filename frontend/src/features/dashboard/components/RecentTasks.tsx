import { Link } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { TaskStatusBadge } from '../../tasks/components/TaskStatusBadge';
import { TaskPriorityBadge } from '../../tasks/components/TaskPriorityBadge';
import { EmptyState } from '../../../components/ui/EmptyState';
import type { Task } from '../../../types/task';

export function RecentTasks({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return <EmptyState title="No recent activity" description="Tasks you create or update will show up here." />;
  }

  return (
    <Card className="p-0">
      <h2 className="border-b border-gray-100 px-4 py-3 text-sm font-semibold text-gray-900">Recent Tasks</h2>
      {tasks.map((task) => (
        <Link
          key={task.id}
          to={`/tasks/${task.id}`}
          className="flex items-center justify-between gap-2 border-b border-gray-100 px-4 py-3 last:border-b-0 hover:bg-gray-50"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">{task.title}</p>
            {task.project && <p className="text-xs text-gray-500">{task.project.name}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <TaskStatusBadge status={task.status} />
            <TaskPriorityBadge priority={task.priority} />
          </div>
        </Link>
      ))}
    </Card>
  );
}
