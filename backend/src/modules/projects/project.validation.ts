import { z } from 'zod';
import { PROJECT_STATUSES } from '../../models/project.model.js';

export const createProjectSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),
    description: z.string().trim().min(1).optional(),
    status: z.enum(PROJECT_STATUSES, {
      message: `Status must be one of: ${PROJECT_STATUSES.join(', ')}`,
    }).optional(),
  })
  .strict();

export const updateProjectSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').optional(),
    description: z.string().trim().min(1).nullable().optional(),
    status: z.enum(PROJECT_STATUSES, {
      message: `Status must be one of: ${PROJECT_STATUSES.join(', ')}`,
    }).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const listProjectTasksQuerySchema = z
  .object({
    search: z.string().trim().min(1).optional(),
    status: z.string().optional(),
    priority: z.string().optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'dueDate', 'priority']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  })
  .strict();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
