import type { NextFunction, Request, Response } from 'express';
import type { ZodError, ZodSchema } from 'zod';
import { AppError, type ErrorDetail } from '../errors/AppError.js';

export interface ValidateSchemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

function toDetails(error: ZodError): ErrorDetail[] {
  return error.issues.map((issue) => ({
    field: issue.path.join('.') || '(root)',
    message: issue.message,
  }));
}

/**
 * Parses body, params, and query against the given Zod schemas and
 * replaces each with the parsed result, so downstream code sees typed,
 * coerced values. A params failure is reported as INVALID_ID since the
 * only param schemas in this app validate Mongo ObjectIds
 * (.kiro/steering/api-standards.md). Body and query failures are
 * VALIDATION_ERROR.
 */
export function validate(schemas: ValidateSchemas) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        next(AppError.invalidId());
        return;
      }
      req.params = result.data as typeof req.params;
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        next(AppError.validation('Request validation failed', toDetails(result.error)));
        return;
      }
      // Express 5 exposes `req.query` as a getter-only accessor with no
      // setter, so a plain assignment throws. Overriding the property
      // with defineProperty is the supported way to replace it with the
      // parsed, coerced result (see tech-stack.md's Express 5 note).
      Object.defineProperty(req, 'query', {
        value: result.data,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    }

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        next(AppError.validation('Request validation failed', toDetails(result.error)));
        return;
      }
      req.body = result.data;
    }

    next();
  };
}
