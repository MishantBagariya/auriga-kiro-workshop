import { env, validateEnvironment } from "./config/environment";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { app } from "./app";

const start = async (): Promise<void> => {
  validateEnvironment();

  await connectDatabase();

  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    console.log(`API base URL: http://localhost:${env.PORT}/api/v1`);
  });
};

// Graceful shutdown
const shutdown = async (): Promise<void> => {
  console.log("Shutting down...");
  await disconnectDatabase();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
