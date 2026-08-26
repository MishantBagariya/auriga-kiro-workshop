import { body, param, query } from "express-validator";
import { TASK_STATUSES, TASK_PRIORITIES } from "../types/task.types";

export const taskValidators = {
  create: [
    body("title")
      .notEmpty()
      .withMessage("Task title is required")
      .isString()
      .trim()
      .isLength({ max: 200 })
      .withMessage("Title cannot exceed 200 characters"),
    body("description")
      .optional()
      .isString()
      .trim()
      .isLength({ max: 2000 })
      .withMessage("Description cannot exceed 2000 characters"),
    body("projectId")
      .notEmpty()
      .withMessage("Project is required")
      .isMongoId()
      .withMessage("Invalid project ID format"),
    body("status")
      .notEmpty()
      .withMessage("Status is required")
      .isIn(TASK_STATUSES)
      .withMessage(`Status must be one of: ${TASK_STATUSES.join(", ")}`),
    body("priority")
      .notEmpty()
      .withMessage("Priority is required")
      .isIn(TASK_PRIORITIES)
      .withMessage(`Priority must be one of: ${TASK_PRIORITIES.join(", ")}`),
    body("dueDate")
      .optional({ values: "null" })
      .isISO8601()
      .withMessage("Due date must be a valid date"),
    body("labels").optional().isArray().withMessage("Labels must be an array"),
    body("labels.*").optional().isString().trim(),
  ],

  update: [
    param("id").isMongoId().withMessage("Invalid task ID format"),
    body("title")
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Title cannot be empty")
      .isLength({ max: 200 })
      .withMessage("Title cannot exceed 200 characters"),
    body("description")
      .optional()
      .isString()
      .trim()
      .isLength({ max: 2000 })
      .withMessage("Description cannot exceed 2000 characters"),
    body("projectId")
      .optional()
      .isMongoId()
      .withMessage("Invalid project ID format"),
    body("status")
      .optional()
      .isIn(TASK_STATUSES)
      .withMessage(`Status must be one of: ${TASK_STATUSES.join(", ")}`),
    body("priority")
      .optional()
      .isIn(TASK_PRIORITIES)
      .withMessage(`Priority must be one of: ${TASK_PRIORITIES.join(", ")}`),
    body("dueDate")
      .optional({ values: "null" })
      .isISO8601()
      .withMessage("Due date must be a valid date"),
    body("labels").optional().isArray().withMessage("Labels must be an array"),
    body("labels.*").optional().isString().trim(),
  ],

  updateStatus: [
    param("id").isMongoId().withMessage("Invalid task ID format"),
    body("status")
      .notEmpty()
      .withMessage("Status is required")
      .isIn(TASK_STATUSES)
      .withMessage(`Status must be one of: ${TASK_STATUSES.join(", ")}`),
  ],

  getById: [param("id").isMongoId().withMessage("Invalid task ID format")],

  delete: [param("id").isMongoId().withMessage("Invalid task ID format")],

  getAll: [
    query("search").optional().isString().trim(),
    query("project")
      .optional()
      .isMongoId()
      .withMessage("Invalid project ID format"),
    query("status")
      .optional()
      .isIn(TASK_STATUSES)
      .withMessage(`Status must be one of: ${TASK_STATUSES.join(", ")}`),
    query("priority")
      .optional()
      .isIn(TASK_PRIORITIES)
      .withMessage(`Priority must be one of: ${TASK_PRIORITIES.join(", ")}`),
    query("sortBy")
      .optional()
      .isIn(["createdAt", "updatedAt", "dueDate", "priority"])
      .withMessage(
        "sortBy must be one of: createdAt, updatedAt, dueDate, priority",
      ),
    query("sortOrder")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("sortOrder must be asc or desc"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
};
