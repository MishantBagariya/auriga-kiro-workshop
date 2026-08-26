import { z } from 'zod';
import { TASK_PRIORITIES, TASK_STATUSES } from '../../models/task.model.js';
import { objectIdSchema } from '../../utils/objectId.js';

const statusEnum = z.enum(TASK_STATUSES, {
  message: `Status must be one of: ${TASK_STATUSES.join(', ')}`,
});

const priorityEnum = z.enum(TASK_PRIORITIES, {
  message: `Priority must be one of: ${TASK_PRIORITIES.join(', ')}`,
});

const dueDateSchema = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'Due date must be a valid date',
  })
  .transform((value) => new Date(value));

export const createTaskSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required'),
    description: z.string().trim().min(1).optional(),
    projectId: objectIdSchema,
    status: statusEnum,
    priority: priorityEnum,
    dueDate: dueDateSchema.optional(),
    labels: z.array(z.string().trim().min(1)).optional(),
  })
  .strict();

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').optional(),
    description: z.string().trim().min(1).nullable().optional(),
    projectId: objectIdSchema.optional(),
    status: statusEnum.optional(),
    priority: priorityEnum.optional(),
    dueDate: dueDateSchema.nullable().optional(),
    labels: z.array(z.string().trim().min(1)).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const updateTaskStatusSchema = z
  .object({
    status: statusEnum,
  })
  .strict();

export const listTasksQuerySchema = z
  .object({
    search: z.string().trim().min(1).optional(),
    projectId: objectIdSchema.optional(),
    status: statusEnum.optional(),
    priority: priorityEnum.optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'dueDate', 'priority']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  })
  .strict();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
