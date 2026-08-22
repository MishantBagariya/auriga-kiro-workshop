import express from "express";
import cors from "cors";
import { projectRouter } from "./modules/projects/project.routes";
import { taskRouter } from "./modules/tasks/task.routes";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes";
import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173" }));
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/api/projects", projectRouter);
  app.use("/api/tasks", taskRouter);
  app.use("/api/dashboard", dashboardRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
