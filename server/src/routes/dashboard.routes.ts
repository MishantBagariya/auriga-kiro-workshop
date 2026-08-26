import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller";

const router = Router();

router.get("/stats", dashboardController.getStats);
router.get("/recent-tasks", dashboardController.getRecentTasks);
router.get("/upcoming-tasks", dashboardController.getUpcomingTasks);

export { router as dashboardRoutes };
