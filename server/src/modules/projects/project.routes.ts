import { Router } from "express";
import { validateBody } from "../../middleware/validate";
import { createProjectSchema, updateProjectSchema } from "./project.schema";
import * as projectController from "./project.controller";

export const projectRouter = Router();

projectRouter.get("/", projectController.listProjects);
projectRouter.get("/:id", projectController.getProject);
projectRouter.post("/", validateBody(createProjectSchema), projectController.createProject);
projectRouter.put("/:id", validateBody(updateProjectSchema), projectController.updateProject);
projectRouter.delete("/:id", projectController.deleteProject);
