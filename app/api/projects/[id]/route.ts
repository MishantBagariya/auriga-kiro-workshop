import {
  error,
  handleUnexpected,
  isUuid,
  notFound,
  success,
  validationError,
} from "@/lib/api";
import { db } from "@/lib/db";
import {
  serializeProjectWithCounts,
  serializeProjectWithTasks,
} from "@/lib/serializers";
import { updateProjectSchema } from "@/lib/validations/project";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/projects/[id] — project details with counts and task list.
export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    if (!isUuid(id)) return error("Invalid project id", { status: 400 });

    const project = await db.project.findUnique({
      where: { id },
      include: {
        tasks: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!project) return notFound("Project not found");

    const { tasks, ...projectData } = project;
    const completedTasks = tasks.filter((t) => t.status === "completed").length;

    return success(
      serializeProjectWithTasks(projectData, tasks, {
        totalTasks: tasks.length,
        completedTasks,
      }),
    );
  } catch (err) {
    return handleUnexpected(err);
  }
}

// PUT /api/projects/[id] — update a project (partial).
export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    if (!isUuid(id)) return error("Invalid project id", { status: 400 });

    const json = await request.json().catch(() => null);
    const parsed = updateProjectSchema.safeParse(json);
    if (!parsed.success) return validationError(parsed.error);

    const existing = await db.project.findUnique({ where: { id } });
    if (!existing) return notFound("Project not found");

    const { name, description, status } = parsed.data;
    const updated = await db.project.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined
          ? { description: description ? description : null }
          : {}),
        ...(status !== undefined ? { status } : {}),
      },
      include: { _count: { select: { tasks: true } } },
    });

    const completedTasks = await db.task.count({
      where: { projectId: id, status: "completed" },
    });

    return success(
      serializeProjectWithCounts(updated, {
        totalTasks: updated._count.tasks,
        completedTasks,
      }),
      { message: "Project updated successfully" },
    );
  } catch (err) {
    return handleUnexpected(err);
  }
}

// DELETE /api/projects/[id] — delete a project and cascade its tasks.
export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    if (!isUuid(id)) return error("Invalid project id", { status: 400 });

    const existing = await db.project.findUnique({ where: { id } });
    if (!existing) return notFound("Project not found");

    // onDelete: Cascade in the schema removes associated tasks.
    await db.project.delete({ where: { id } });

    return success({ id }, { message: "Project deleted successfully" });
  } catch (err) {
    return handleUnexpected(err);
  }
}
