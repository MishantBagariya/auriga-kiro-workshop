import { Schema, model } from "mongoose";
import { ITask, TASK_STATUSES, TASK_PRIORITIES } from "../types/task.types";

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
      default: "",
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project is required"],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: TASK_STATUSES,
        message: "Status must be one of: todo, in-progress, completed",
      },
      default: "todo",
      required: true,
    },
    priority: {
      type: String,
      enum: {
        values: TASK_PRIORITIES,
        message: "Priority must be one of: low, medium, high",
      },
      default: "medium",
      required: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    labels: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ projectId: 1, status: 1 });
taskSchema.index({ title: "text" });
taskSchema.index({ createdAt: -1 });
taskSchema.index({ updatedAt: -1 });

export const Task = model<ITask>("Task", taskSchema);
