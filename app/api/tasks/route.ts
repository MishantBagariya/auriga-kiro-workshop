import { created, handleUnexpected, notFound, success, validationError } from "@/lib/api";
import { db } from "@/lib/db";
import { serializeLabels, serializeTaskWithProject } from "@/lib/serializers";
import { createTaskSchema, taskListQuerySchema } from "@/lib/validations/task";
import type { Paginated, TaskPriority, TaskWithProject } from "@/types";

// Priority is stored as a string; rank it for meaningful ordering.
const PRIORITY_RANK: Record<TaskPriority, number> = {
  low: 0,
  medium: 1,
  high: 2,
};

const taskWithProjectInclude = {
  project: { select: { id: true, name: true } },
} as const;

// GET /api/tasks — list tasks with search / filter / sort / pagination.
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const parsed = taskListQuerySchema.safeParse(
      Object.fromEntries(url.searchParams),
    );
    if (!parsed.success) return validationError(parsed.error);

    const { search, projectId, status, priority, sortBy, order, page, pageSize } =
      parsed.data;

    const where = {
      ...(search ? { title: { contains: search, mode: "insensitive" as const } } : {}),
      ...(projectId ? { projectId } : {}),
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
    };

    const total = await db.task.count({ where });
    const skip = (page - 1) * pageSize;

    let rows;
    if (sortBy === "priority") {
      // Priority is a string column; rank-sort in-handler over the filtered set.
      const all = await db.task.findMany({
        where,
        include: taskWithProjectInclude,
      });
      all.sort((a, b) => {
        const diff =
          PRIORITY_RANK[a.priority as TaskPriority] -
          PRIORITY_RANK[b.priority as TaskPriority];
        return order === "asc" ? diff : -diff;
      });
      rows = all.slice(skip, skip + pageSize);
    } else {
      // dueDate nulls sort last regardless of direction feels natural, but
      // keep it simple/consistent: let the DB order nulls per its default.
      rows = await db.task.findMany({
        where,
        include: taskWithProjectInclude,
        orderBy: { [sortBy]: order },
        skip,
        take: pageSize,
      });
    }

    const items: TaskWithProject[] = rows.map(serializeTaskWithProject);
    const data: Paginated<TaskWithProject> = {
      items,
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };

    return success(data);
  } catch (err) {
    return handleUnexpected(err);
  }
}

// POST /api/tasks — create a task (verifies the project exists).
export async function POST(request: Request) {
  try {
    const json = await request.json().catch(() => null);
    const parsed = createTaskSchema.safeParse(json);
    if (!parsed.success) return validationError(parsed.error);

    const { title, description, projectId, status, priority, dueDate, labels } =
      parsed.data;

    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });
    if (!project) return notFound("Project not found");

    const task = await db.task.create({
      data: {
        title,
        description: description ? description : null,
        projectId,
        status,
        priority,
        dueDate: dueDate ?? null,
        labels: serializeLabels(labels),
      },
      include: taskWithProjectInclude,
    });

    return created(
      serializeTaskWithProject(task),
      "Task created successfully",
    );
  } catch (err) {
    return handleUnexpected(err);
  }
}
