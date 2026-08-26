import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { TASK_PRIORITIES, TASK_STATUSES } from '../../../types/task';
import { taskPriorityLabels, taskStatusLabels } from '../../../lib/labels';
import { useProjectOptions } from '../hooks/useProjectOptions';
import type { Task } from '../../../types/task';
import type { ApiFieldError } from '../../../types/api';

const taskFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().optional(),
  projectId: z.string().min(1, 'Project is required'),
  status: z.enum(TASK_STATUSES),
  priority: z.enum(TASK_PRIORITIES),
  dueDate: z.string().optional(),
  labels: z.string().optional(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  defaultValues?: Partial<Task>;
  defaultProjectId?: string;
  onSubmit: (values: TaskFormValues) => void;
  isSubmitting?: boolean;
  serverErrors?: ApiFieldError[];
  submitLabel: string;
}

export function TaskForm({ defaultValues, defaultProjectId, onSubmit, isSubmitting, serverErrors, submitLabel }: TaskFormProps) {
  const { data: projects, isLoading: projectsLoading } = useProjectOptions();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      projectId: defaultValues?.projectId ?? defaultProjectId ?? '',
      status: defaultValues?.status ?? 'todo',
      priority: defaultValues?.priority ?? 'medium',
      dueDate: defaultValues?.dueDate ? defaultValues.dueDate.slice(0, 10) : '',
      labels: defaultValues?.labels?.join(', ') ?? '',
    },
  });

  serverErrors?.forEach((err) => {
    const field = err.field as keyof TaskFormValues;
    if (['title', 'description', 'projectId', 'status', 'priority', 'dueDate', 'labels'].includes(field)) {
      setError(field, { message: err.message });
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input label="Title" {...register('title')} error={errors.title?.message} autoFocus />
      <Textarea label="Description (optional)" {...register('description')} error={errors.description?.message} />
      <Select label="Project" {...register('projectId')} error={errors.projectId?.message} disabled={projectsLoading}>
        <option value="">Select a project…</option>
        {projects?.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </Select>
      <div className="grid grid-cols-2 gap-4">
        <Select label="Status" {...register('status')} error={errors.status?.message}>
          {TASK_STATUSES.map((status) => (
            <option key={status} value={status}>
              {taskStatusLabels[status]}
            </option>
          ))}
        </Select>
        <Select label="Priority" {...register('priority')} error={errors.priority?.message}>
          {TASK_PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {taskPriorityLabels[priority]}
            </option>
          ))}
        </Select>
      </div>
      <Input label="Due Date (optional)" type="date" {...register('dueDate')} error={errors.dueDate?.message} />
      <Input
        label="Labels (optional, comma-separated)"
        placeholder="copy, seo"
        {...register('labels')}
        error={errors.labels?.message}
      />
      <div className="mt-2 flex justify-end gap-2">
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
