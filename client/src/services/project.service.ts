import { api } from "./api";
import type {
  Project,
  ProjectWithStats,
  CreateProjectDto,
  UpdateProjectDto,
  ApiResponse,
} from "../types";

export const projectService = {
  async getAll(): Promise<ProjectWithStats[]> {
    const response = await api.get<unknown, ApiResponse<ProjectWithStats[]>>(
      "/projects",
    );
    return response.data;
  },

  async getById(id: string): Promise<ProjectWithStats> {
    const response = await api.get<unknown, ApiResponse<ProjectWithStats>>(
      `/projects/${id}`,
    );
    return response.data;
  },

  async create(data: CreateProjectDto): Promise<Project> {
    const response = await api.post<unknown, ApiResponse<Project>>(
      "/projects",
      data,
    );
    return response.data;
  },

  async update(id: string, data: UpdateProjectDto): Promise<Project> {
    const response = await api.put<unknown, ApiResponse<Project>>(
      `/projects/${id}`,
      data,
    );
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  },
};
