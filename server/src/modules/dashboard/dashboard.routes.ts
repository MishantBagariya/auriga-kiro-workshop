import { Router } from "express";
import * as dashboardController from "./dashboard.controller";

export const dashboardRouter = Router();

dashboardRouter.get("/", dashboardController.getDashboard);
