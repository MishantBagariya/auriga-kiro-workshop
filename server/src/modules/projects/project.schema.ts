import { z } from "zod";

export const PROJECT_STATUSES = ["Active", "Completed", "Archived"] as const;

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().optional(),
  status: z.enum(PROJECT_STATUSES).optional(),
});

export const updateProjectSchema = z
  .object({
    name: z.string().trim().min(1, "Name cannot be empty").optional(),
    description: z.string().trim().optional(),
    status: z.enum(PROJECT_STATUSES).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
