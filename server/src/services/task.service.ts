import { FilterQuery, SortOrder } from "mongoose";
import { Task } from "../models/task.model";
import { Project } from "../models/project.model";
import { AppError } from "../utils/app-error";
import {
  CreateTaskDto,
  UpdateTaskDto,
  ITask,
  TaskQueryParams,
} from "../types/task.types";
import { PaginationMeta } from "../types/common.types";

const PRIORITY_ORDER: Record<string, number> = { high: 3, medium: 2, low: 1 };

interface TaskResult {
  tasks: unknown[];
  meta: PaginationMeta;
}

interface ITaskService {
  getAll(params: TaskQueryParams): Promise<TaskResult>;
  getById(id: string): Promise<unknown>;
  create(data: CreateTaskDto): Promise<unknown>;
  update(id: string, data: UpdateTaskDto): Promise<unknown>;
  updateStatus(id: string, status: string): Promise<unknown>;
  delete(id: string): Promise<void>;
}

export const TaskService: ITaskService = {
  async getAll(params: TaskQueryParams): Promise<TaskResult> {
    const page = parseInt(params.page || "1", 10);
    const limit = parseInt(params.limit || "20", 10);
    const skip = (page - 1) * limit;

    const filter: FilterQuery<ITask> = {};

    if (params.search) {
      filter.title = { $regex: params.search, $options: "i" };
    }
    if (params.project) {
      filter.projectId = params.project;
    }
    if (params.status) {
      filter.status = params.status;
    }
    if (params.priority) {
      filter.priority = params.priority;
    }

    const sortBy = params.sortBy || "createdAt";
    const sortOrder: SortOrder = params.sortOrder === "asc" ? 1 : -1;
    const sortOption: Record<string, SortOrder> = { [sortBy]: sortOrder };

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate("projectId", "name")
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      Task.countDocuments(filter),
    ]);

    // If sorting by priority, do a stable re-sort in memory
    if (sortBy === "priority") {
      tasks.sort((a, b) => {
        const aVal = PRIORITY_ORDER[a.priority] || 0;
        const bVal = PRIORITY_ORDER[b.priority] || 0;
        return sortOrder === 1 ? aVal - bVal : bVal - aVal;
      });
    }

    // Transform populated projectId to project field
    const transformedTasks = tasks.map((task) => {
      const populated = task.projectId as unknown as {
        _id: string;
        name: string;
      } | null;
      return {
        ...task,
        projectId: populated?._id || task.projectId,
        project: populated
          ? { _id: populated._id, name: populated.name }
          : null,
      };
    });

    const totalPages = Math.ceil(total / limit);

    return {
      tasks: transformedTasks,
      meta: { total, page, limit, totalPages },
    };
  },

  async getById(id: string) {
    const task = await Task.findById(id).populate("projectId", "name").lean();
    if (!task) throw new AppError("Task not found", 404);

    const populated = task.projectId as unknown as {
      _id: string;
      name: string;
    } | null;
    return {
      ...task,
      projectId: populated?._id || task.projectId,
      project: populated ? { _id: populated._id, name: populated.name } : null,
    };
  },

  async create(data: CreateTaskDto) {
    const project = await Project.findById(data.projectId);
    if (!project)
      throw new AppError(
        "Project not found. Cannot create task for non-existent project.",
        422,
      );

    const task = await Task.create({
      title: data.title,
      description: data.description || "",
      projectId: data.projectId,
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate || null,
      labels: data.labels || [],
    });

    return task.toObject();
  },

  async update(id: string, data: UpdateTaskDto) {
    if (data.projectId) {
      const project = await Project.findById(data.projectId);
      if (!project) throw new AppError("Project not found", 422);
    }

    const task = await Task.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean();

    if (!task) throw new AppError("Task not found", 404);
    return task;
  },

  async updateStatus(id: string, status: string) {
    const task = await Task.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    ).lean();

    if (!task) throw new AppError("Task not found", 404);
    return task;
  },

  async delete(id: string): Promise<void> {
    const task = await Task.findByIdAndDelete(id);
    if (!task) throw new AppError("Task not found", 404);
  },
};
