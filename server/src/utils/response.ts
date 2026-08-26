import { Response } from "express";
import { PaginationMeta } from "../types/common.types";

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: PaginationMeta,
): void => {
  const response: { success: true; data: T; meta?: PaginationMeta } = {
    success: true,
    data,
  };
  if (meta) response.meta = meta;
  res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  details?: unknown,
): void => {
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      details,
    },
  });
};
