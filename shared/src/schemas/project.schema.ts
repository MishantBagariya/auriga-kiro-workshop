import { z } from 'zod'

export const projectStatusEnum = z.enum(['ACTIVE', 'COMPLETED', 'ARCHIVED'])
export type ProjectStatus = z.infer<typeof projectStatusEnum>

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional().default(''),
  status: projectStatusEnum.optional().default('ACTIVE'),
})

export const updateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Name must be 100 characters or less').optional(),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
  status: projectStatusEnum.optional(),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
