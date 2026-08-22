import { useState, type DragEvent } from "react";
import { KanbanCard } from "./KanbanCard";
import { cn } from "../../lib/cn";
import type { Task, TaskStatus } from "../../types";

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onDragStart: (task: Task) => void;
  onDrop: (status: TaskStatus) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}

const COLUMN_ACCENT: Record<TaskStatus, string> = {
  "To Do": "border-t-slate-400",
  "In Progress": "border-t-blue-500",
  Completed: "border-t-green-500",
};

export function KanbanColumn({ status, tasks, onDragStart, onDrop, onStatusChange }: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };

  return (
    <div
      className={cn(
        "flex min-w-[280px] flex-1 flex-col rounded-lg border border-t-4 bg-slate-100/60 p-3",
        COLUMN_ACCENT[status],
        isOver ? "border-slate-300 bg-indigo-50/60" : "border-slate-200"
      )}
      onDragOver={handleDragOver}
      onDragLeave={() => setIsOver(false)}
      onDrop={() => {
        setIsOver(false);
        onDrop(status);
      }}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-slate-700">{status}</h3>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500">
          {tasks.length}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {tasks.map((task) => (
          <KanbanCard
            key={task.id}
            task={task}
            onDragStart={onDragStart}
            onStatusChange={(s) => onStatusChange(task, s)}
          />
        ))}
        {tasks.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 px-3 py-6 text-center text-xs text-slate-400">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
}
