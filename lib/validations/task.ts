import { z } from "zod";
import {
  SORT_ORDERS,
  TASK_PRIORITIES,
  TASK_SORT_FIELDS,
  TASK_STATUSES,
} from "@/types";

// Shared Zod schemas for tasks. Used by API route handlers and client forms.

export const taskStatusSchema = z.enum(TASK_STATUSES);
export const taskPrioritySchema = z.enum(TASK_PRIORITIES);

// Accepts an ISO date string or empty/undefined; coerces to a Date for storage.
const dueDateSchema = z
  .string()
  .trim()
  .refine((val) => val === "" || !Number.isNaN(Date.parse(val)), {
    message: "Due date must be a valid date",
  })
  .transform((val) => (val === "" ? null : new Date(val)))
  .nullable()
  .optional();

const labelsSchema = z
  .array(z.string().trim().min(1).max(30))
  .max(20, "A task can have at most 20 labels")
  .optional();

// Base field shapes without defaults, so update schemas can be truly partial.
const taskFields = {
  title: z
    .string()
    .trim()
    .min(1, "Task title is required")
    .max(150, "Title must be 150 characters or fewer"),
  description: z
    .string()
    .trim()
    .max(2000, "Description must be 2000 characters or fewer")
    .optional()
    .or(z.literal("")),
  projectId: z.uuid("A valid project must be selected"),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  dueDate: dueDateSchema,
  labels: labelsSchema,
};

export const createTaskSchema = z.object({
  ...taskFields,
  // On create, status/priority/labels default when omitted.
  status: taskStatusSchema.default("todo"),
  priority: taskPrioritySchema.default("medium"),
  labels: labelsSchema.default([]),
});

// All fields optional for partial updates, but at least one must be present.
export const updateTaskSchema = z
  .object(taskFields)
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

// Status-only update (PATCH /api/tasks/[id]/status).
export const updateTaskStatusSchema = z.object({
  status: taskStatusSchema,
});

// Query params for GET /api/tasks (search / filter / sort / paginate).
// Values arrive as strings from the URL, so use coercion where needed.
export const taskListQuerySchema = z.object({
  search: z.string().trim().optional(),
  projectId: z.uuid().optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  sortBy: z.enum(TASK_SORT_FIELDS).default("createdAt"),
  order: z.enum(SORT_ORDERS).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
export type TaskListQuery = z.infer<typeof taskListQuerySchema>;
