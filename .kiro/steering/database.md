---
inclusion: auto
description: MongoDB schema design and Mongoose conventions for TaskFlow
---

# Database Conventions

## Technology

- **Database:** MongoDB
- **ODM:** Mongoose
- **Connection:** Via connection string in environment variable

## Schema Design

### Project Schema

```typescript
const projectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    status: {
      type: String,
      enum: ["active", "completed", "archived"],
      default: "active",
      required: true,
    },
  },
  { timestamps: true },
);
```

### Task Schema

```typescript
const taskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000, default: "" },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "completed"],
      default: "todo",
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
      required: true,
    },
    dueDate: { type: Date, default: null },
    labels: [{ type: String, trim: true }],
  },
  { timestamps: true },
);
```

## Naming Conventions

| Item            | Convention                          | Example                |
| --------------- | ----------------------------------- | ---------------------- |
| Model name      | PascalCase singular                 | `Project`, `Task`      |
| Collection name | lowercase plural (auto by Mongoose) | `projects`, `tasks`    |
| File name       | kebab-case with `.model.ts` suffix  | `project.model.ts`     |
| Field names     | camelCase                           | `projectId`, `dueDate` |

## Relationships

- **Project → Tasks**: One-to-Many
- Tasks reference their parent Project via `projectId` (ObjectId)
- Use Mongoose `ref` for population when needed
- Do NOT embed tasks inside projects (separate collections)

## Indexes

```typescript
// Task indexes for common query patterns
taskSchema.index({ projectId: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ title: "text" }); // Text index for search
taskSchema.index({ projectId: 1, status: 1 }); // Compound for filtered queries
```

## Timestamps

- Always enable `{ timestamps: true }` on all schemas
- This auto-creates `createdAt` and `updatedAt` fields (Date type)
- No need to manually manage these fields

## Enum Values

```typescript
// Use these exact values throughout the application
export const PROJECT_STATUSES = ["active", "completed", "archived"] as const;
export const TASK_STATUSES = ["todo", "in-progress", "completed"] as const;
export const TASK_PRIORITIES = ["low", "medium", "high"] as const;
```

## Cascade Delete

When a Project is deleted, all associated Tasks must also be deleted.

Implement in the service layer (not Mongoose middleware) for explicit control:

```typescript
// In project.service.ts
async deleteProject(id: string): Promise<void> {
  const project = await Project.findById(id);
  if (!project) throw new AppError('Project not found', 404);

  await Task.deleteMany({ projectId: id });
  await Project.findByIdAndDelete(id);
}
```

## TypeScript Interfaces

Define interfaces for each model that extend Mongoose's Document:

```typescript
export interface IProject {
  name: string;
  description: string;
  status: "active" | "completed" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

export interface ITask {
  title: string;
  description: string;
  projectId: Types.ObjectId;
  status: "todo" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate: Date | null;
  labels: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

## Validation Rules

- Validate at schema level for data integrity (required, enum, maxlength)
- Validate at API level for user-facing error messages (express-validator)
- Both layers should enforce the same constraints
- Schema validation is the last line of defense

## Connection Management

- Connect once at application startup
- Handle connection errors gracefully with retry logic
- Log connection status
- Close connection on process termination (SIGINT, SIGTERM)

```typescript
// config/database.ts
import mongoose from "mongoose";

export const connectDatabase = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/taskflow";
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
};
```
