import express, { type Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import { projectRouter } from './modules/projects/project.routes.js';
import { taskRouter } from './modules/tasks/task.routes.js';
import { dashboardRouter } from './modules/dashboard/dashboard.routes.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import { asyncHandler } from './middleware/asyncHandler.js';

/**
 * Builds the Express app without starting a listener, so tests
 * (Supertest) can exercise it in-process. server.ts owns listening.
 */
export function createApp(): Express {
  const app = express();

  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());
  if (env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  app.get(
    '/api/health',
    asyncHandler(async (_req, res) => {
      const state = mongoose.connection.readyState;
      res.status(200).json({
        data: { status: 'ok', database: state === 1 ? 'connected' : 'disconnected' },
      });
    }),
  );

  app.use('/api/projects', projectRouter);
  app.use('/api/tasks', taskRouter);
  app.use('/api/dashboard', dashboardRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
