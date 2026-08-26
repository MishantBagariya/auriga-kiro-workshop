import { Router } from "express";
import { projectController } from "../controllers/project.controller";
import { projectValidators } from "../validators/project.validator";
import { validate } from "../middleware/validate";

const router = Router();

router.get("/", projectController.getAll);
router.post("/", projectValidators.create, validate, projectController.create);
router.get(
  "/:id",
  projectValidators.getById,
  validate,
  projectController.getById,
);
router.put(
  "/:id",
  projectValidators.update,
  validate,
  projectController.update,
);
router.delete(
  "/:id",
  projectValidators.delete,
  validate,
  projectController.delete,
);

export { router as projectRoutes };
