import { RequestHandler } from "express";
import * as projectService from "./project.service";

export const listProjects: RequestHandler = async (_req, res, next) => {
  try {
    const projects = await projectService.listProjects();
    res.json(projects);
  } catch (err) {
    next(err);
  }
};

export const getProject: RequestHandler = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    res.json(project);
  } catch (err) {
    next(err);
  }
};

export const createProject: RequestHandler = async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.body);
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
};

export const updateProject: RequestHandler = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.body);
    res.json(project);
  } catch (err) {
    next(err);
  }
};

export const deleteProject: RequestHandler = async (req, res, next) => {
  try {
    await projectService.deleteProject(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
