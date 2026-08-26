import type { NextFunction, Request, RequestHandler, Response } from 'express';

type AsyncRouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Wraps an async controller so a rejected promise reaches errorHandler.
 * Express 5 already forwards async rejections automatically, but this
 * wrapper is kept for explicitness and a consistent handler signature
 * across every route, per .kiro/steering/tech-stack.md.
 */
export function asyncHandler(handler: AsyncRouteHandler): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}
