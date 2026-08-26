import { Request, Response, NextFunction } from "express";
import { ProjectService } from "../services/project.service";
import { sendSuccess } from "../utils/response";

export const projectController = {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const projects = await ProjectService.getAll();
      sendSuccess(res, projects);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.getById(req.params.id);
      sendSuccess(res, project);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.create(req.body);
      sendSuccess(res, project, 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.update(req.params.id, req.body);
      sendSuccess(res, project);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await ProjectService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
