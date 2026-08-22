import { prisma } from "../../lib/prisma";
import { AppError } from "../../errors/AppError";
import { CreateProjectInput, UpdateProjectInput } from "./project.schema";
import { serializeTask } from "../tasks/task.service";

function serializeProject(project: any) {
  const { _count, tasks, ...rest } = project;
  return {
    ...rest,
    ...(tasks ? { tasks: tasks.map(serializeTask) } : {}),
  };
}

export async function listProjects() {
  const projects = await prisma.project.findMany({
    orderBy: { createdDate: "desc" },
    include: { _count: { select: { tasks: true } } },
  });

  const projectIds = projects.map((p) => p.id);
  const completedGroups = projectIds.length
    ? await prisma.task.groupBy({
        by: ["projectId"],
        where: { projectId: { in: projectIds }, status: "Completed" },
        _count: true,
      })
    : [];
  const completedMap = new Map(completedGroups.map((g: any) => [g.projectId, g._count]));

  return projects.map((p) => ({
    ...serializeProject(p),
    taskCount: p._count.tasks,
    completedTaskCount: completedMap.get(p.id) ?? 0,
  }));
}

export async function getProjectById(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: { tasks: { orderBy: { createdDate: "desc" } } },
  });
  if (!project) {
    throw new AppError(404, "Project not found");
  }
  const taskCount = project.tasks.length;
  const completedTaskCount = project.tasks.filter((t) => t.status === "Completed").length;
  return {
    ...serializeProject(project),
    taskCount,
    completedTaskCount,
  };
}

export async function createProject(input: CreateProjectInput) {
  const project = await prisma.project.create({
    data: {
      name: input.name,
      description: input.description,
      status: input.status,
    },
  });
  return { ...serializeProject(project), taskCount: 0, completedTaskCount: 0 };
}

async function ensureProjectExists(id: string) {
  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, "Project not found");
  }
}

export async function updateProject(id: string, input: UpdateProjectInput) {
  await ensureProjectExists(id);
  const project = await prisma.project.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
    },
  });
  return getProjectById(project.id);
}

export async function deleteProject(id: string) {
  await ensureProjectExists(id);
  await prisma.project.delete({ where: { id } });
}
