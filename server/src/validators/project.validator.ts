import { body, param } from "express-validator";
import { PROJECT_STATUSES } from "../types/project.types";

export const projectValidators = {
  create: [
    body("name")
      .notEmpty()
      .withMessage("Project name is required")
      .isString()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Name cannot exceed 100 characters"),
    body("description")
      .optional()
      .isString()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description cannot exceed 500 characters"),
    body("status")
      .optional()
      .isIn(PROJECT_STATUSES)
      .withMessage(`Status must be one of: ${PROJECT_STATUSES.join(", ")}`),
  ],

  update: [
    param("id").isMongoId().withMessage("Invalid project ID format"),
    body("name")
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Name cannot be empty")
      .isLength({ max: 100 })
      .withMessage("Name cannot exceed 100 characters"),
    body("description")
      .optional()
      .isString()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description cannot exceed 500 characters"),
    body("status")
      .optional()
      .isIn(PROJECT_STATUSES)
      .withMessage(`Status must be one of: ${PROJECT_STATUSES.join(", ")}`),
  ],

  getById: [param("id").isMongoId().withMessage("Invalid project ID format")],

  delete: [param("id").isMongoId().withMessage("Invalid project ID format")],
};
