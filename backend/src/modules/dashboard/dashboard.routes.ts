import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import * as dashboardController from './dashboard.controller.js';

export const dashboardRouter = Router();

dashboardRouter.get('/summary', asyncHandler(dashboardController.summary));
