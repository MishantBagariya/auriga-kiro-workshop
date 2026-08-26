import { api } from "./api";
import type {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskStatus,
  TaskQueryParams,
  ApiResponse,
  PaginationMeta,
} from "../types";

export const taskService = {
  async getAll(
    params?: TaskQueryParams,
  ): Promise<{ tasks: Task[]; meta: PaginationMeta }> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.set("search", params.search);
    if (params?.project) queryParams.set("project", params.project);
    if (params?.status) queryParams.set("status", params.status);
    if (params?.priority) queryParams.set("priority", params.priority);
    if (params?.sortBy) queryParams.set("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.set("sortOrder", params.sortOrder);
    if (params?.page) queryParams.set("page", String(params.page));
    if (params?.limit) queryParams.set("limit", String(params.limit));

    const query = queryParams.toString();
    const url = query ? `/tasks?${query}` : "/tasks";
    const response = await api.get<unknown, ApiResponse<Task[]>>(url);
    return {
      tasks: response.data,
      meta: response.meta || { total: 0, page: 1, limit: 20, totalPages: 0 },
    };
  },

  async getById(id: string): Promise<Task> {
    const response = await api.get<unknown, ApiResponse<Task>>(`/tasks/${id}`);
    return response.data;
  },

  async create(data: CreateTaskDto): Promise<Task> {
    const response = await api.post<unknown, ApiResponse<Task>>("/tasks", data);
    return response.data;
  },

  async update(id: string, data: UpdateTaskDto): Promise<Task> {
    const response = await api.put<unknown, ApiResponse<Task>>(
      `/tasks/${id}`,
      data,
    );
    return response.data;
  },

  async updateStatus(id: string, status: TaskStatus): Promise<Task> {
    const response = await api.patch<unknown, ApiResponse<Task>>(
      `/tasks/${id}/status`,
      {
        status,
      },
    );
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },
};
