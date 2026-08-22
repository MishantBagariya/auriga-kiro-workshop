import { prisma } from "../../lib/prisma";
import { AppError } from "../../errors/AppError";
import { CreateTaskInput, TaskQueryInput, UpdateTaskInput, UpdateTaskStatusInput } from "./task.schema";

const STATUS_TO_INTERNAL: Record<string, "ToDo" | "InProgress" | "Completed"> = {
  "To Do": "ToDo",
  "In Progress": "InProgress",
  Completed: "Completed",
};

const STATUS_TO_DISPLAY: Record<string, string> = {
  ToDo: "To Do",
  InProgress: "In Progress",
  Completed: "Completed",
};

const PRIORITY_RANK: Record<string, number> = { Low: 0, Medium: 1, High: 2 };

export function mapStatusToInternal(status: string) {
  return STATUS_TO_INTERNAL[status];
}

export function serializeTask(task: any) {
  const { labels, status, project, ...rest } = task;
  return {
    ...rest,
    status: STATUS_TO_DISPLAY[status] ?? status,
    labels: labels ? JSON.parse(labels) : [],
    ...(project ? { project: { id: project.id, name: project.name } } : {}),
  };
}

const PROJECT_MINIMAL_SELECT = { id: true, name: true } as const;

async function ensureProjectExists(projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    throw new AppError(400, "Validation failed", { projectId: "No project exists with this id" });
  }
}

async function ensureTaskExists(id: string) {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) {
    throw new AppError(404, "Task not found");
  }
  return task;
}

export async function listTasks(query: TaskQueryInput) {
  const where: any = {};
  if (query.search) {
    where.title = { contains: query.search };
  }
  if (query.projectId) {
    where.projectId = query.projectId;
  }
  if (query.status) {
    where.status = mapStatusToInternal(query.status);
  }
  if (query.priority) {
    where.priority = query.priority;
  }

  const orderBy =
    query.sortBy === "priority" ? undefined : { [query.sortBy]: query.sortOrder };

  const tasks = await prisma.task.findMany({
    where,
    ...(orderBy ? { orderBy } : {}),
    include: { project: { select: PROJECT_MINIMAL_SELECT } },
  });

  if (query.sortBy === "priority") {
    tasks.sort((a, b) => {
      const diff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      return query.sortOrder === "asc" ? diff : -diff;
    });
  }

  return tasks.map(serializeTask);
}

export async function getTaskById(id: string) {
  const task = await prisma.task.findUnique({
    where: { id },
    include: { project: true },
  });
  if (!task) {
    throw new AppError(404, "Task not found");
  }
  return serializeTask(task);
}

export async function createTask(input: CreateTaskInput) {
  await ensureProjectExists(input.projectId);
  const task = await prisma.task.create({
    data: {
      title: input.title,
      description: input.description,
      projectId: input.projectId,
      status: input.status ? mapStatusToInternal(input.status) : undefined,
      priority: input.priority,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      labels: input.labels ? JSON.stringify(input.labels) : undefined,
    },
    include: { project: { select: PROJECT_MINIMAL_SELECT } },
  });
  return serializeTask(task);
}

export async function updateTask(id: string, input: UpdateTaskInput) {
  await ensureTaskExists(id);
  if (input.projectId) {
    await ensureProjectExists(input.projectId);
  }
  const task = await prisma.task.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.projectId !== undefined ? { projectId: input.projectId } : {}),
      ...(input.status !== undefined ? { status: mapStatusToInternal(input.status) } : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.dueDate !== undefined
        ? { dueDate: input.dueDate ? new Date(input.dueDate) : null }
        : {}),
      ...(input.labels !== undefined ? { labels: JSON.stringify(input.labels) } : {}),
    },
    include: { project: { select: PROJECT_MINIMAL_SELECT } },
  });
  return serializeTask(task);
}

export async function updateTaskStatus(id: string, input: UpdateTaskStatusInput) {
  await ensureTaskExists(id);
  const task = await prisma.task.update({
    where: { id },
    data: { status: mapStatusToInternal(input.status) },
    include: { project: { select: PROJECT_MINIMAL_SELECT } },
  });
  return serializeTask(task);
}

export async function deleteTask(id: string) {
  await ensureTaskExists(id);
  await prisma.task.delete({ where: { id } });
}
