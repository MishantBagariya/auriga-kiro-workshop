import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || "3001", 10),
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/taskflow",
  NODE_ENV: process.env.NODE_ENV || "development",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
};

export const validateEnvironment = (): void => {
  const required = ["MONGODB_URI"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn(
      `Warning: Missing environment variables: ${missing.join(", ")}. Using defaults.`,
    );
  }
};
