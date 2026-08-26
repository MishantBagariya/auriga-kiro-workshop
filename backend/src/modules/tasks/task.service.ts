import mongoose from 'mongoose';
import { PRIORITY_WEIGHT, Task, type TaskPriority, type TaskStatus } from '../../models/task.model.js';
import { Project } from '../../models/project.model.js';
import { AppError } from '../../errors/AppError.js';
import { buildPaginationMeta, DEFAULT_LIMIT, DEFAULT_PAGE } from '../../utils/pagination.js';
import type { CreateTaskInput, UpdateTaskInput } from './task.validation.js';

export interface ListTasksFilters {
  search?: string;
  projectId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface ProjectRef {
  id: string;
  name: string;
}

async function attachProjects(tasks: Record<string, unknown>[]): Promise<Record<string, unknown>[]> {
  const projectIds = [...new Set(tasks.map((t) => t.projectId as string))];
  const projects = await Project.find({ _id: { $in: projectIds } }, { name: 1 });
  const byId = new Map<string, ProjectRef>(
    projects.map((p): [string, ProjectRef] => {
      const id = p._id.toString();
      return [id, { id, name: String(p.name) }];
    }),
  );
  return tasks.map((t) => ({ ...t, project: byId.get(t.projectId as string) ?? null }));
}

/**
 * Builds the match stage and sort stage shared by listTasks and
 * listTasksForProject. Priority sorts on a numeric weight
 * (high=3, medium=2, low=1) rather than the raw string field, because
 * the alphabetical order (high, low, medium) is meaningless to a user.
 * Due-date sorts push documents with no due date to the end in both
 * directions, and every sort adds _id as a tiebreaker for stable
 * pagination (see api-standards.md).
 */
function buildMatch(filters: ListTasksFilters): Record<string, unknown> {
  const match: Record<string, unknown> = {};

  if (filters.projectId) {
    match.projectId = new mongoose.Types.ObjectId(filters.projectId);
  }
  if (filters.status) {
    match.status = filters.status;
  }
  if (filters.priority) {
    match.priority = filters.priority;
  }
  if (filters.search) {
    match.title = { $regex: filters.search, $options: 'i' };
  }

  return match;
}

async function runTaskQuery(match: Record<string, unknown>, filters: ListTasksFilters) {
  const sortBy = filters.sortBy ?? 'createdAt';
  const sortOrder = filters.sortOrder ?? 'desc';
  const direction = sortOrder === 'asc' ? 1 : -1;
  const page = filters.page ?? DEFAULT_PAGE;
  const limit = filters.limit ?? DEFAULT_LIMIT;
  const skip = (page - 1) * limit;

  const pipeline: mongoose.PipelineStage[] = [{ $match: match }];

  if (sortBy === 'priority') {
    pipeline.push({
      $addFields: {
        priorityWeight: {
          $switch: {
            branches: [
              { case: { $eq: ['$priority', 'high'] }, then: PRIORITY_WEIGHT.high },
              { case: { $eq: ['$priority', 'medium'] }, then: PRIORITY_WEIGHT.medium },
              { case: { $eq: ['$priority', 'low'] }, then: PRIORITY_WEIGHT.low },
            ],
            default: 0,
          },
        },
      },
    });
    pipeline.push({ $sort: { priorityWeight: direction, _id: 1 } });
  } else if (sortBy === 'dueDate') {
    // Missing due dates sort last regardless of direction: bucket 1 = has
    // a date, bucket 0 = none, and the bucket itself always sorts with
    // "has a date" first.
    pipeline.push({
      $addFields: {
        hasDueDate: { $cond: [{ $ifNull: ['$dueDate', false] }, 1, 0] },
      },
    });
    pipeline.push({ $sort: { hasDueDate: -1, dueDate: direction, _id: 1 } });
  } else {
    pipeline.push({ $sort: { [sortBy]: direction, _id: 1 } });
  }

  const countPipeline = [...pipeline, { $count: 'total' }];
  pipeline.push({ $skip: skip }, { $limit: limit });

  const [docs, countResult] = await Promise.all([
    Task.aggregate(pipeline),
    Task.aggregate(countPipeline),
  ]);

  const total = countResult[0]?.total ?? 0;
  const serialized = docs.map((doc) => {
    const task = new Task(doc).toJSON();
    return task;
  });

  return { tasks: serialized, meta: buildPaginationMeta(total, page, limit) };
}

export async function listTasks(filters: ListTasksFilters) {
  const match = buildMatch(filters);
  const { tasks, meta } = await runTaskQuery(match, filters);
  const withProjects = await attachProjects(tasks);
  return { tasks: withProjects, meta };
}

export async function listTasksForProject(projectId: string, filters: Omit<ListTasksFilters, 'projectId'>) {
  const exists = await Project.exists({ _id: projectId });
  if (!exists) {
    throw AppError.notFound('Project not found');
  }
  return listTasks({ ...filters, projectId });
}

export async function getTaskById(id: string) {
  const task = await Task.findById(id);
  if (!task) {
    throw AppError.notFound('Task not found');
  }
  const [withProject] = await attachProjects([task.toJSON()]);
  return withProject;
}

export async function createTask(input: CreateTaskInput) {
  const projectExists = await Project.exists({ _id: input.projectId });
  if (!projectExists) {
    throw AppError.notFound('Project not found');
  }
  const task = await Task.create(input);
  const [withProject] = await attachProjects([task.toJSON()]);
  return withProject;
}

export async function updateTask(id: string, input: UpdateTaskInput) {
  if (input.projectId) {
    const projectExists = await Project.exists({ _id: input.projectId });
    if (!projectExists) {
      throw AppError.notFound('Project not found');
    }
  }

  const update: Record<string, unknown> = { ...input };
  if ('description' in input && input.description === null) {
    update.description = undefined;
  }
  if ('dueDate' in input && input.dueDate === null) {
    update.dueDate = undefined;
  }

  const task = await Task.findByIdAndUpdate(id, update, { new: true });
  if (!task) {
    throw AppError.notFound('Task not found');
  }
  const [withProject] = await attachProjects([task.toJSON()]);
  return withProject;
}

export async function updateTaskStatus(id: string, status: TaskStatus) {
  const task = await Task.findByIdAndUpdate(id, { status }, { new: true });
  if (!task) {
    throw AppError.notFound('Task not found');
  }
  const [withProject] = await attachProjects([task.toJSON()]);
  return withProject;
}

export async function deleteTask(id: string): Promise<void> {
  const task = await Task.findByIdAndDelete(id);
  if (!task) {
    throw AppError.notFound('Task not found');
  }
}
