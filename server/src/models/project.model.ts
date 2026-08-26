import { Schema, model } from "mongoose";
import { IProject, PROJECT_STATUSES } from "../types/project.types";

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },
    status: {
      type: String,
      enum: {
        values: PROJECT_STATUSES,
        message: "Status must be one of: active, completed, archived",
      },
      default: "active",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

projectSchema.index({ status: 1 });
projectSchema.index({ createdAt: -1 });

export const Project = model<IProject>("Project", projectSchema);
