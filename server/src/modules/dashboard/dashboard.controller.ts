import { RequestHandler } from "express";
import * as dashboardService from "./dashboard.service";

export const getDashboard: RequestHandler = async (_req, res, next) => {
  try {
    const dashboard = await dashboardService.getDashboard();
    res.json(dashboard);
  } catch (err) {
    next(err);
  }
};
