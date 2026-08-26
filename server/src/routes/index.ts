import { Router } from "express";
import { projectRoutes } from "./project.routes";
import { taskRoutes } from "./task.routes";
import { dashboardRoutes } from "./dashboard.routes";

const router = Router();

router.use("/projects", projectRoutes);
router.use("/tasks", taskRoutes);
router.use("/dashboard", dashboardRoutes);

export { router as apiRoutes };
