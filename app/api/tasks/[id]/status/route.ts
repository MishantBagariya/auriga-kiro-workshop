import {
  error,
  handleUnexpected,
  isUuid,
  notFound,
  success,
  validationError,
} from "@/lib/api";
import { db } from "@/lib/db";
import { serializeTaskWithProject } from "@/lib/serializers";
import { updateTaskStatusSchema } from "@/lib/validations/task";

type RouteContext = { params: Promise<{ id: string }> };

// PATCH /api/tasks/[id]/status — update only the task's status.
export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    if (!isUuid(id)) return error("Invalid task id", { status: 400 });

    const json = await request.json().catch(() => null);
    const parsed = updateTaskStatusSchema.safeParse(json);
    if (!parsed.success) return validationError(parsed.error);

    const existing = await db.task.findUnique({ where: { id } });
    if (!existing) return notFound("Task not found");

    const updated = await db.task.update({
      where: { id },
      data: { status: parsed.data.status },
      include: { project: { select: { id: true, name: true } } },
    });

    return success(serializeTaskWithProject(updated), {
      message: "Task status updated",
    });
  } catch (err) {
    return handleUnexpected(err);
  }
}
