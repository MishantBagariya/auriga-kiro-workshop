import { useRef } from "react";
import { KanbanColumn } from "./KanbanColumn";
import { useUpdateTaskStatus } from "../../hooks/useTasks";
import { useToast } from "../ui/ToastProvider";
import { TASK_STATUSES, type Task, type TaskStatus } from "../../types";

export function KanbanBoard({ tasks }: { tasks: Task[] }) {
  const draggedTask = useRef<Task | null>(null);
  const updateStatus = useUpdateTaskStatus();
  const toast = useToast();

  const changeStatus = (task: Task, status: TaskStatus) => {
    if (task.status === status) return;
    updateStatus.mutate(
      { id: task.id, status },
      {
        onSuccess: () => toast.success(`"${task.title}" moved to ${status}`),
        onError: () => toast.error("Couldn't update task status. Please try again."),
      }
    );
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {TASK_STATUSES.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          tasks={tasks.filter((t) => t.status === status)}
          onDragStart={(task) => {
            draggedTask.current = task;
          }}
          onDrop={(status) => {
            if (draggedTask.current) {
              changeStatus(draggedTask.current, status);
              draggedTask.current = null;
            }
          }}
          onStatusChange={changeStatus}
        />
      ))}
    </div>
  );
}
