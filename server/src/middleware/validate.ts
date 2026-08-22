import { RequestHandler } from "express";
import { ZodSchema } from "zod";
import { AppError } from "../errors/AppError";

function fieldsFromZodError(error: { issues: { path: (string | number)[]; message: string }[] }) {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join(".") : "_";
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}

export function validateBody(schema: ZodSchema): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(new AppError(400, "Validation failed", fieldsFromZodError(result.error)));
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodSchema): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      next(new AppError(400, "Validation failed", fieldsFromZodError(result.error)));
      return;
    }
    (req as any).validatedQuery = result.data;
    next();
  };
}
