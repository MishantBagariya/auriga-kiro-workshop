import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer | null = null;

export const connectDatabase = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || "";

  if (uri) {
    // Try connecting to external MongoDB first
    try {
      await mongoose.connect(uri);
      console.log("Connected to MongoDB:", uri);
      return;
    } catch (error) {
      console.log(
        "External MongoDB not available, falling back to in-memory server...",
      );
    }
  }

  // Fallback: use in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const memoryUri = mongoServer.getUri();
  await mongoose.connect(memoryUri);
  console.log("Connected to in-memory MongoDB");
  console.log("Note: Data will not persist between restarts.");

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected");
  });
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};
