import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { PROJECT_STATUSES } from '../../../types/project';
import { projectStatusLabels } from '../../../lib/labels';
import type { Project } from '../../../types/project';
import type { ApiFieldError } from '../../../types/api';

const projectFormSchema = z.object({
  name: z.string().trim().min(1, 'Project name is required'),
  description: z.string().trim().optional(),
  status: z.enum(PROJECT_STATUSES).optional(),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface ProjectFormProps {
  defaultValues?: Partial<Project>;
  onSubmit: (values: ProjectFormValues) => void;
  isSubmitting?: boolean;
  serverErrors?: ApiFieldError[];
  submitLabel: string;
}

export function ProjectForm({ defaultValues, onSubmit, isSubmitting, serverErrors, submitLabel }: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
      status: defaultValues?.status ?? 'active',
    },
  });

  // Map server-side field errors (VALIDATION_ERROR details) onto the
  // matching form fields, per api-standards.md.
  serverErrors?.forEach((err) => {
    if (err.field === 'name' || err.field === 'description' || err.field === 'status') {
      setError(err.field, { message: err.message });
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input label="Project Name" {...register('name')} error={errors.name?.message} autoFocus />
      <Textarea label="Description (optional)" {...register('description')} error={errors.description?.message} />
      <Select label="Status" {...register('status')} error={errors.status?.message}>
        {PROJECT_STATUSES.map((status) => (
          <option key={status} value={status}>
            {projectStatusLabels[status]}
          </option>
        ))}
      </Select>
      <div className="mt-2 flex justify-end gap-2">
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
