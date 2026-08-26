import { Modal } from '../../../components/ui/Modal';
import { TaskForm, type TaskFormValues } from './TaskForm';
import { useToast } from '../../../hooks/useToast';
import { useCreateTask } from '../hooks/useCreateTask';
import { useUpdateTask } from '../hooks/useUpdateTask';
import type { Task } from '../../../types/task';
import type { ApiError } from '../../../types/api';
import type { CreateTaskInput, UpdateTaskInput } from '../types';

interface TaskFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task;
  defaultProjectId?: string;
}

function toLabelsArray(value?: string): string[] | undefined {
  if (!value) return undefined;
  const labels = value
    .split(',')
    .map((l) => l.trim())
    .filter(Boolean);
  return labels.length > 0 ? labels : undefined;
}

export function TaskFormDialog({ isOpen, onClose, task, defaultProjectId }: TaskFormDialogProps) {
  const { showToast } = useToast();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask(task?.id ?? '', task?.projectId);

  const isEditing = !!task;

  const handleSubmit = (values: TaskFormValues) => {
    const labels = toLabelsArray(values.labels);
    const dueDate = values.dueDate ? new Date(values.dueDate).toISOString() : undefined;

    if (isEditing) {
      const input: UpdateTaskInput = {
        title: values.title,
        description: values.description || null,
        projectId: values.projectId,
        status: values.status,
        priority: values.priority,
        dueDate: dueDate ?? null,
        labels,
      };
      updateTask.mutate(input, {
        onSuccess: () => {
          showToast('Task updated successfully');
          onClose();
          updateTask.reset();
        },
        onError: (error) => {
          const apiError = error as ApiError;
          if (apiError.code !== 'VALIDATION_ERROR') showToast(apiError.message, 'error');
        },
      });
    } else {
      const input: CreateTaskInput = {
        title: values.title,
        description: values.description || undefined,
        projectId: values.projectId,
        status: values.status,
        priority: values.priority,
        dueDate,
        labels,
      };
      createTask.mutate(input, {
        onSuccess: () => {
          showToast('Task created successfully');
          onClose();
          createTask.reset();
        },
        onError: (error) => {
          const apiError = error as ApiError;
          if (apiError.code !== 'VALIDATION_ERROR') showToast(apiError.message, 'error');
        },
      });
    }
  };

  const mutation = isEditing ? updateTask : createTask;

  return (
    <Modal title={isEditing ? 'Edit Task' : 'Create Task'} isOpen={isOpen} onClose={onClose}>
      <TaskForm
        defaultValues={task}
        defaultProjectId={defaultProjectId}
        onSubmit={handleSubmit}
        isSubmitting={mutation.isPending}
        serverErrors={(mutation.error as ApiError | null)?.details}
        submitLabel={isEditing ? 'Save Changes' : 'Create Task'}
      />
    </Modal>
  );
}
