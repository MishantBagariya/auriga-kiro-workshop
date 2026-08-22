import { Dialog } from "../ui/Dialog";
import { TaskForm } from "./TaskForm";
import { useCreateTask, useUpdateTask } from "../../hooks/useTasks";
import { useToast } from "../ui/ToastProvider";
import type { CreateTaskInput, Task } from "../../types";

interface TaskFormDialogProps {
  open: boolean;
  onClose: () => void;
  task?: Task;
  lockedProjectId?: string;
  onCreated?: (task: Task) => void;
}

export function TaskFormDialog({ open, onClose, task, lockedProjectId, onCreated }: TaskFormDialogProps) {
  const toast = useToast();
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask(task?.id ?? "");
  const loading = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (input: CreateTaskInput) => {
    if (task) {
      await updateMutation.mutateAsync(input);
      toast.success("Task updated");
    } else {
      const created = await createMutation.mutateAsync(input);
      toast.success("Task created");
      onCreated?.(created);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title={task ? "Edit task" : "New task"}>
      <TaskForm
        initialValues={task}
        lockedProjectId={lockedProjectId}
        loading={loading}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Dialog>
  );
}
