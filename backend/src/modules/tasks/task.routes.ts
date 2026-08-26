import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { validate } from '../../middleware/validate.js';
import { idParamSchema } from '../../utils/objectId.js';
import * as taskController from './task.controller.js';
import {
  createTaskSchema,
  listTasksQuerySchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from './task.validation.js';

export const taskRouter = Router();

taskRouter.get(
  '/',
  validate({ query: listTasksQuerySchema }),
  asyncHandler(taskController.list),
);

taskRouter.post(
  '/',
  validate({ body: createTaskSchema }),
  asyncHandler(taskController.create),
);

taskRouter.get(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(taskController.getOne),
);

taskRouter.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateTaskSchema }),
  asyncHandler(taskController.update),
);

taskRouter.patch(
  '/:id/status',
  validate({ params: idParamSchema, body: updateTaskStatusSchema }),
  asyncHandler(taskController.updateStatus),
);

taskRouter.delete(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(taskController.remove),
);
