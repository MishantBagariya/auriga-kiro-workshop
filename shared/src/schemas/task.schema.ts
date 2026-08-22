import { z } from 'zod'

export const taskStatusEnum = z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED'])
export type TaskStatus = z.infer<typeof taskStatusEnum>

export const taskPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH'])
export type TaskPriority = z.infer<typeof taskPriorityEnum>

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200, 'Title must be 200 characters or less'),
  description: z.string().max(2000, 'Description must be 2000 characters or less').optional().default(''),
  projectId: z.string().min(1, 'Project is required'),
  status: taskStatusEnum.optional().default('TODO'),
  priority: taskPriorityEnum.optional().default('MEDIUM'),
  dueDate: z.string().datetime({ offset: true }).optional().nullable(),
  labels: z.array(z.string()).optional().default([]),
})

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200, 'Title must be 200 characters or less').optional(),
  description: z.string().max(2000, 'Description must be 2000 characters or less').optional(),
  projectId: z.string().min(1, 'Project is required').optional(),
  status: taskStatusEnum.optional(),
  priority: taskPriorityEnum.optional(),
  dueDate: z.string().datetime({ offset: true }).optional().nullable(),
  labels: z.array(z.string()).optional(),
})

export const updateTaskStatusSchema = z.object({
  status: taskStatusEnum,
})

export const taskQuerySchema = z.object({
  search: z.string().optional(),
  projectId: z.string().optional(),
  status: taskStatusEnum.optional(),
  priority: taskPriorityEnum.optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'dueDate', 'priority']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>
export type TaskQueryInput = z.infer<typeof taskQuerySchema>
