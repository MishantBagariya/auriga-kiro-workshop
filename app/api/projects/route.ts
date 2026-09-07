import { created, handleUnexpected, success, validationError } from "@/lib/api";
import { db } from "@/lib/db";
import { serializeProjectWithCounts } from "@/lib/serializers";
import { createProjectSchema } from "@/lib/validations/project";
import type { ProjectWithCounts } from "@/types";

// GET /api/projects — list all projects with task counts.
export async function GET() {
  try {
    const projects = await db.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { tasks: true } },
      },
    });

    // One grouped query for completed-task counts across all projects.
    const completedGroups = await db.task.groupBy({
      by: ["projectId"],
      where: { status: "completed" },
      _count: { _all: true },
    });
    const completedByProject = new Map(
      completedGroups.map((g) => [g.projectId, g._count._all]),
    );

    const data: ProjectWithCounts[] = projects.map((project) =>
      serializeProjectWithCounts(project, {
        totalTasks: project._count.tasks,
        completedTasks: completedByProject.get(project.id) ?? 0,
      }),
    );

    return success(data);
  } catch (err) {
    return handleUnexpected(err);
  }
}

// POST /api/projects — create a project.
export async function POST(request: Request) {
  try {
    const json = await request.json().catch(() => null);
    const parsed = createProjectSchema.safeParse(json);
    if (!parsed.success) return validationError(parsed.error);

    const { name, description, status } = parsed.data;
    const project = await db.project.create({
      data: {
        name,
        description: description ? description : null,
        status,
      },
    });

    return created(
      serializeProjectWithCounts(project, {
        totalTasks: 0,
        completedTasks: 0,
      }),
      "Project created successfully",
    );
  } catch (err) {
    return handleUnexpected(err);
  }
}
