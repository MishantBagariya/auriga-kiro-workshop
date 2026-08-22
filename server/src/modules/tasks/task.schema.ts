import { z } from "zod";

export const TASK_STATUSES = ["To Do", "In Progress", "Completed"] as const;
export const TASK_PRIORITIES = ["Low", "Medium", "High"] as const;
export const TASK_SORT_FIELDS = ["createdDate", "updatedDate", "dueDate", "priority"] as const;

const isoDateString = z
  .string()
  .refine((val) => !Number.isNaN(Date.parse(val)), { message: "Must be a valid date" });

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  projectId: z.string().trim().min(1, "Project is required"),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  description: z.string().trim().optional(),
  dueDate: isoDateString.optional().nullable(),
  labels: z.array(z.string().trim().min(1)).optional(),
});

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1, "Title cannot be empty").optional(),
    projectId: z.string().trim().min(1, "Project cannot be empty").optional(),
    status: z.enum(TASK_STATUSES).optional(),
    priority: z.enum(TASK_PRIORITIES).optional(),
    description: z.string().trim().optional(),
    dueDate: isoDateString.optional().nullable(),
    labels: z.array(z.string().trim().min(1)).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const updateTaskStatusSchema = z.object({
  status: z.enum(TASK_STATUSES),
});

export const taskQuerySchema = z.object({
  search: z.string().trim().optional(),
  projectId: z.string().trim().optional(),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  sortBy: z.enum(TASK_SORT_FIELDS).optional().default("createdDate"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
