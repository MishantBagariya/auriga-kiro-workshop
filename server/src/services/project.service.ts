import { Project } from "../models/project.model";
import { Task } from "../models/task.model";
import { AppError } from "../utils/app-error";
import { CreateProjectDto, UpdateProjectDto } from "../types/project.types";

interface ProjectWithStats {
  _id: unknown;
  name: string;
  description: string;
  status: string;
  createdAt: unknown;
  updatedAt: unknown;
  taskCount: number;
  completedTaskCount: number;
}

export const ProjectService = {
  async getAll(): Promise<ProjectWithStats[]> {
    const projects = await Project.find().sort({ createdAt: -1 }).lean();

    const projectsWithStats: ProjectWithStats[] = await Promise.all(
      projects.map(async (project) => {
        const taskCount = await Task.countDocuments({ projectId: project._id });
        const completedTaskCount = await Task.countDocuments({
          projectId: project._id,
          status: "completed",
        });
        return { ...project, taskCount, completedTaskCount };
      }),
    );

    return projectsWithStats;
  },

  async getById(id: string): Promise<ProjectWithStats> {
    const project = await Project.findById(id).lean();
    if (!project) throw new AppError("Project not found", 404);

    const taskCount = await Task.countDocuments({ projectId: project._id });
    const completedTaskCount = await Task.countDocuments({
      projectId: project._id,
      status: "completed",
    });

    return { ...project, taskCount, completedTaskCount };
  },

  async create(data: CreateProjectDto) {
    const project = await Project.create({
      name: data.name,
      description: data.description || "",
      status: data.status || "active",
    });
    return project.toObject();
  },

  async update(id: string, data: UpdateProjectDto) {
    const project = await Project.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean();

    if (!project) throw new AppError("Project not found", 404);
    return project;
  },

  async delete(id: string): Promise<void> {
    const project = await Project.findById(id);
    if (!project) throw new AppError("Project not found", 404);

    await Task.deleteMany({ projectId: id });
    await Project.findByIdAndDelete(id);
  },
};
