import express from "express";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/environment";
import { apiRoutes } from "./routes";
import { errorHandler } from "./middleware/error-handler";
import { notFound } from "./middleware/not-found";

const app = express();

// Middleware
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type"],
  }),
);
app.use(express.json());
if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Routes
app.use("/api/v1", apiRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

export { app };
