import { z } from "zod";
import { PROJECT_STATUSES } from "@/types";

// Shared Zod schemas for projects. Used by API route handlers and client forms.

export const projectStatusSchema = z.enum(PROJECT_STATUSES);

// Base field shapes without defaults, so update schemas can be truly partial.
const projectFields = {
  name: z
    .string()
    .trim()
    .min(1, "Project name is required")
    .max(100, "Project name must be 100 characters or fewer"),
  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or fewer")
    .optional()
    .or(z.literal("")),
  status: projectStatusSchema,
};

export const createProjectSchema = z.object({
  ...projectFields,
  // On create, status defaults to "active" when omitted.
  status: projectStatusSchema.default("active"),
});

// All fields optional for partial updates, but at least one must be present.
export const updateProjectSchema = z
  .object(projectFields)
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
