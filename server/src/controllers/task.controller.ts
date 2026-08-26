import { Request, Response, NextFunction } from "express";
import { TaskService } from "../services/task.service";
import { sendSuccess } from "../utils/response";
import { TaskQueryParams } from "../types/task.types";

export const taskController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const params: TaskQueryParams = {
        search: req.query.search as string | undefined,
        project: req.query.project as string | undefined,
        status: req.query.status as TaskQueryParams["status"],
        priority: req.query.priority as TaskQueryParams["priority"],
        sortBy: req.query.sortBy as TaskQueryParams["sortBy"],
        sortOrder: req.query.sortOrder as TaskQueryParams["sortOrder"],
        page: req.query.page as string | undefined,
        limit: req.query.limit as string | undefined,
      };

      const { tasks, meta } = await TaskService.getAll(params);
      sendSuccess(res, tasks, 200, meta);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.getById(req.params.id);
      sendSuccess(res, task);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.create(req.body);
      sendSuccess(res, task, 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.update(req.params.id, req.body);
      sendSuccess(res, task);
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.updateStatus(
        req.params.id,
        req.body.status,
      );
      sendSuccess(res, task);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await TaskService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
