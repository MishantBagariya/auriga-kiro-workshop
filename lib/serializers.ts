import type {
  Project,
  ProjectStatus,
  ProjectWithCounts,
  ProjectWithTasks,
  Task,
  TaskPriority,
  TaskStatus,
  TaskWithProject,
} from "@/types";
import type { ProjectModel, TaskModel } from "./generated/prisma/models";

// Serializers convert Prisma rows (Date objects, labels as JSON string) into the
// API/type shapes from types/index.ts (ISO date strings, labels as string[]).

/** Parse the stored labels JSON string into a string[] (empty on null/invalid). */
function parseLabels(labels: string | null): string[] {
  if (!labels) return [];
  try {
    const parsed = JSON.parse(labels);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string");
    }
    return [];
  } catch {
    return [];
  }
}

/** Serialize a string[] of labels into the JSON string stored in the DB. */
export function serializeLabels(labels: string[] | undefined): string | null {
  if (!labels || labels.length === 0) return null;
  return JSON.stringify(labels);
}

export function serializeProject(project: ProjectModel): Project {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status as ProjectStatus,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

export function serializeProjectWithCounts(
  project: ProjectModel,
  counts: { totalTasks: number; completedTasks: number },
): ProjectWithCounts {
  return {
    ...serializeProject(project),
    totalTasks: counts.totalTasks,
    completedTasks: counts.completedTasks,
  };
}

export function serializeProjectWithTasks(
  project: ProjectModel,
  tasks: TaskModel[],
  counts: { totalTasks: number; completedTasks: number },
): ProjectWithTasks {
  return {
    ...serializeProjectWithCounts(project, counts),
    tasks: tasks.map((task) => serializeTask(task)),
  };
}

export function serializeTask(task: TaskModel): Task {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    projectId: task.projectId,
    status: task.status as TaskStatus,
    priority: task.priority as TaskPriority,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    labels: parseLabels(task.labels),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export function serializeTaskWithProject(
  task: TaskModel & { project: Pick<ProjectModel, "id" | "name"> },
): TaskWithProject {
  return {
    ...serializeTask(task),
    project: { id: task.project.id, name: task.project.name },
  };
}
