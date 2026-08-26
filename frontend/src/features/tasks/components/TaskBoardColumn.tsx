import { useState } from 'react';
import { TaskCard } from './TaskCard';
import { taskStatusLabels } from '../../../lib/labels';
import type { Task, TaskStatus } from '../../../types/task';

interface TaskBoardColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onDrop: (taskId: string, status: TaskStatus) => void;
}

export function TaskBoardColumn({ status, tasks, onDrop }: TaskBoardColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  return (
    <div
      className={`flex w-72 shrink-0 flex-col rounded-xl border bg-gray-50 p-3 ${
        isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={() => {
        setIsDragOver(false);
        if (draggedTaskId) onDrop(draggedTaskId, status);
      }}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-gray-700">{taskStatusLabels[status]}</h3>
        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">{tasks.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} draggable onDragStart={(t) => setDraggedTaskId(t.id)} />
        ))}
      </div>
    </div>
  );
}
