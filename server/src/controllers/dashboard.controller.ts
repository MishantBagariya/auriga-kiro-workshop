import { Request, Response, NextFunction } from "express";
import { DashboardService } from "../services/dashboard.service";
import { sendSuccess } from "../utils/response";

export const dashboardController = {
  async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await DashboardService.getStats();
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  },

  async getRecentTasks(_req: Request, res: Response, next: NextFunction) {
    try {
      const tasks = await DashboardService.getRecentTasks();
      sendSuccess(res, tasks);
    } catch (error) {
      next(error);
    }
  },

  async getUpcomingTasks(_req: Request, res: Response, next: NextFunction) {
    try {
      const tasks = await DashboardService.getUpcomingTasks();
      sendSuccess(res, tasks);
    } catch (error) {
      next(error);
    }
  },
};
