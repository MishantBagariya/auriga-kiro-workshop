import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma v7 configuration. The migration/CLI connection URL lives here
// (moved out of schema.prisma). The app connects via a driver adapter in lib/db.ts.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
