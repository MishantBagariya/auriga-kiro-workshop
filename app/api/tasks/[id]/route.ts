import {
  error,
  handleUnexpected,
  isUuid,
  notFound,
  success,
  validationError,
} from "@/lib/api";
import { db } from "@/lib/db";
import { serializeLabels, serializeTaskWithProject } from "@/lib/serializers";
import { updateTaskSchema } from "@/lib/validations/task";

type RouteContext = { params: Promise<{ id: string }> };

const taskWithProjectInclude = {
  project: { select: { id: true, name: true } },
} as const;

// GET /api/tasks/[id] — task details with its project.
export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    if (!isUuid(id)) return error("Invalid task id", { status: 400 });

    const task = await db.task.findUnique({
      where: { id },
      include: taskWithProjectInclude,
    });
    if (!task) return notFound("Task not found");

    return success(serializeTaskWithProject(task));
  } catch (err) {
    return handleUnexpected(err);
  }
}

// PUT /api/tasks/[id] — update a task (partial; re-verifies project on change).
export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    if (!isUuid(id)) return error("Invalid task id", { status: 400 });

    const json = await request.json().catch(() => null);
    const parsed = updateTaskSchema.safeParse(json);
    if (!parsed.success) return validationError(parsed.error);

    const existing = await db.task.findUnique({ where: { id } });
    if (!existing) return notFound("Task not found");

    const { title, description, projectId, status, priority, dueDate, labels } =
      parsed.data;

    // If the task is being moved to another project, verify it exists.
    if (projectId !== undefined && projectId !== existing.projectId) {
      const project = await db.project.findUnique({
        where: { id: projectId },
        select: { id: true },
      });
      if (!project) return notFound("Project not found");
    }

    const updated = await db.task.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined
          ? { description: description ? description : null }
          : {}),
        ...(projectId !== undefined ? { projectId } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(priority !== undefined ? { priority } : {}),
        ...(dueDate !== undefined ? { dueDate: dueDate ?? null } : {}),
        ...(labels !== undefined ? { labels: serializeLabels(labels) } : {}),
      },
      include: taskWithProjectInclude,
    });

    return success(serializeTaskWithProject(updated), {
      message: "Task updated successfully",
    });
  } catch (err) {
    return handleUnexpected(err);
  }
}

// DELETE /api/tasks/[id] — delete a task.
export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    if (!isUuid(id)) return error("Invalid task id", { status: 400 });

    const existing = await db.task.findUnique({ where: { id } });
    if (!existing) return notFound("Task not found");

    await db.task.delete({ where: { id } });

    return success({ id }, { message: "Task deleted successfully" });
  } catch (err) {
    return handleUnexpected(err);
  }
}
