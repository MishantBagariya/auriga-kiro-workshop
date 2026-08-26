import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { validate } from '../../middleware/validate.js';
import { idParamSchema } from '../../utils/objectId.js';
import * as projectController from './project.controller.js';
import { createProjectSchema, listProjectTasksQuerySchema, updateProjectSchema } from './project.validation.js';

export const projectRouter = Router();

projectRouter.get('/', asyncHandler(projectController.list));

projectRouter.post(
  '/',
  validate({ body: createProjectSchema }),
  asyncHandler(projectController.create),
);

projectRouter.get(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(projectController.getOne),
);

projectRouter.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateProjectSchema }),
  asyncHandler(projectController.update),
);

projectRouter.delete(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(projectController.remove),
);

projectRouter.get(
  '/:id/tasks',
  validate({ params: idParamSchema, query: listProjectTasksQuerySchema }),
  asyncHandler(projectController.listTasks),
);
