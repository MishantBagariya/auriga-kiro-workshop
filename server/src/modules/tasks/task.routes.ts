import { Router } from "express";
import { validateBody, validateQuery } from "../../middleware/validate";
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  taskQuerySchema,
} from "./task.schema";
import * as taskController from "./task.controller";

export const taskRouter = Router();

taskRouter.get("/", validateQuery(taskQuerySchema), taskController.listTasks);
taskRouter.get("/:id", taskController.getTask);
taskRouter.post("/", validateBody(createTaskSchema), taskController.createTask);
taskRouter.put("/:id", validateBody(updateTaskSchema), taskController.updateTask);
taskRouter.patch(
  "/:id/status",
  validateBody(updateTaskStatusSchema),
  taskController.updateTaskStatus
);
taskRouter.delete("/:id", taskController.deleteTask);
