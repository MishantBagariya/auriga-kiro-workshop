import type { Request, Response } from 'express';
import { AppError } from '../errors/AppError.js';

/**
 * Registered after all routes and before errorHandler. Any request that
 * reaches here matched no route.
 */
export function notFound(req: Request, _res: Response): void {
  throw AppError.notFound(`Route not found: ${req.method} ${req.originalUrl}`);
}
