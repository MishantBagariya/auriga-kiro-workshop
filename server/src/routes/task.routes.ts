import { Router } from "express";
import { taskController } from "../controllers/task.controller";
import { taskValidators } from "../validators/task.validator";
import { validate } from "../middleware/validate";

const router = Router();

router.get("/", taskValidators.getAll, validate, taskController.getAll);
router.post("/", taskValidators.create, validate, taskController.create);
router.get("/:id", taskValidators.getById, validate, taskController.getById);
router.put("/:id", taskValidators.update, validate, taskController.update);
router.patch(
  "/:id/status",
  taskValidators.updateStatus,
  validate,
  taskController.updateStatus,
);
router.delete("/:id", taskValidators.delete, validate, taskController.delete);

export { router as taskRoutes };
