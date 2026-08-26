import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error";
import mongoose from "mongoose";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Custom AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  // Mongoose CastError (invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({
      success: false,
      error: {
        message: "Invalid ID format",
      },
    });
    return;
  }

  // Mongoose ValidationError
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
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

  // Unknown error
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: {
      message: "Internal server error",
    },
  });
};
