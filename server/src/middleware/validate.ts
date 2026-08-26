import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

export const validate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const details = errors.array().map((err) => ({
      field: "path" in err ? err.path : "unknown",
      message: err.msg as string,
    }));

    res.status(422).json({
      success: false,
      error: {
        message: "Validation failed",
        details,
      },
    });
    return;
  }

  next();
};
