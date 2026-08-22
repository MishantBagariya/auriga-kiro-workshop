import { RequestHandler } from "express";

export const notFound: RequestHandler = (req, res) => {
  res.status(404).json({
    error: { message: `No route found for ${req.method} ${req.originalUrl}` },
  });
};
