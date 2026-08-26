import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/AppError.js';

/**
 * Last middleware in the chain. Converts anything thrown anywhere into
 * the standard error envelope from .kiro/steering/api-standards.md.
 * Unknown errors are logged server-side and reduced to a generic 500
 * so internals never leak to the client.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
    return;
  }

  // eslint-disable-next-line no-console
  console.error('Unhandled error:', err);

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong. Please try again.',
    },
  });
}
