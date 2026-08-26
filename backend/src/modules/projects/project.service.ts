import { Project } from '../../models/project.model.js';
import { Task } from '../../models/task.model.js';
import { AppError } from '../../errors/AppError.js';
import type { CreateProjectInput, UpdateProjectInput } from './project.validation.js';

/**
 * Shapes a raw project document plus its task counts into the API
 * response shape described in api-standards.md. Counts are attached
 * here rather than stored on the document, since they are derived.
 */
async function withTaskCounts(projectJson: Record<string, unknown>) {
  const [taskCount, completedTaskCount] = await Promise.all([
    Task.countDocuments({ projectId: projectJson.id }),
    Task.countDocuments({ projectId: projectJson.id, status: 'completed' }),
  ]);
  return { ...projectJson, taskCount, completedTaskCount };
}

export async function listProjects() {
  const projects = await Project.find().sort({ createdAt: -1 });
  return Promise.all(projects.map((p) => withTaskCounts(p.toJSON())));
}

export async function getProjectById(id: string) {
  const project = await Project.findById(id);
  if (!project) {
    throw AppError.notFound('Project not found');
  }
  return withTaskCounts(project.toJSON());
}

export async function createProject(input: CreateProjectInput) {
  const project = await Project.create(input);
  return withTaskCounts(project.toJSON());
}

export async function updateProject(id: string, input: UpdateProjectInput) {
  const project = await Project.findByIdAndUpdate(id, input, { new: true });
  if (!project) {
    throw AppError.notFound('Project not found');
  }
  return withTaskCounts(project.toJSON());
}

/**
 * Deletes the project and all of its tasks. Tasks are deleted first so a
 * failure between the two steps cannot leave a task orphaned behind a
 * missing project. This is not atomic (no replica set / transactions in
 * this environment) — see api-standards.md for the accepted tradeoff.
 */
export async function deleteProject(id: string): Promise<void> {
  const project = await Project.findById(id);
  if (!project) {
    throw AppError.notFound('Project not found');
  }
  await Task.deleteMany({ projectId: id });
  await Project.findByIdAndDelete(id);
}

export async function assertProjectExists(id: string): Promise<void> {
  const exists = await Project.exists({ _id: id });
  if (!exists) {
    throw AppError.notFound('Project not found');
  }
}
