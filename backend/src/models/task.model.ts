import { Schema, model, Types, type InferSchemaType } from 'mongoose';

export const TASK_STATUSES = ['todo', 'in_progress', 'completed'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

/** Numeric weight used to sort by priority meaningfully instead of alphabetically. */
export const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

const taskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: undefined },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    status: {
      type: String,
      enum: TASK_STATUSES,
      required: true,
      default: 'todo',
    },
    priority: {
      type: String,
      enum: TASK_PRIORITIES,
      required: true,
      default: 'medium',
    },
    dueDate: { type: Date, default: undefined },
    labels: { type: [String], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      // See project.model.ts for why `ret` is loosely typed here.
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id.toString();
        if (ret.projectId instanceof Types.ObjectId) {
          ret.projectId = ret.projectId.toString();
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

taskSchema.index({ projectId: 1 });
// Search matches partial, case-insensitive substrings of the title (see
// api-standards.md), so a regex query is used rather than a $text index,
// which only matches whole words.
taskSchema.index({ title: 1 });

export type TaskDoc = InferSchemaType<typeof taskSchema>;

export const Task = model('Task', taskSchema);
