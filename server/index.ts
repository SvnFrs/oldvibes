import express from "express";
import { createServer } from "http";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { redis } from "./config/redis.config";
import { setupSwagger } from "./config/swagger.config";
import { initializeSocket } from "./services/socket.service";
import authRoutes from "./routes/auth.routes";
import vibeRoutes from "./routes/vibe.routes";
import userRoutes from "./routes/user.routes";
import commentRoutes from "./routes/comment.routes";
import chatRoutes from "./routes/chat.routes";
import { setupCronJobs } from "./job/cleanup.job";

import "./schema/user.schema";
import "./schema/vibe.schema";
import "./schema/comment.schema";
import "./schema/message.schema";
import "./schema/conversation.schema";

// Load environment variables
dotenv.config();

setupCronJobs();

const app = express();
const server = createServer(app); // Create HTTP server for Socket.io
const PORT = process.env.PORT || 4000;

// Initialize Socket.io BEFORE other middleware
const socketService = initializeSocket(server);

// Security middlewares
app.use(
  helmet({
    crossOriginEmbedderPolicy: false, // Allow Socket.io connections
  }),
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  }),
);

// CORS - Allow Socket.io
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["your-production-domain.com"]
        : ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    await mongoose.connect(mongoURI, {
      dbName: process.env.DB_NAME || "oldvibes",
    });
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Health check (place this before other routes)
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Old Vibes API is running!",
    connectedUsers: socketService.getConnectedUsers().length,
    socketio: "enabled",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/vibes", vibeRoutes);
app.use("/api/users", userRoutes);
app.use("/api", commentRoutes);
app.use("/api/chat", chatRoutes);

// Setup Swagger documentation
setupSwagger(app);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
    method: req.method,
  });
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Error:", err);
    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  },
);

// Start server
const startServer = async () => {
  try {
    await connectDB();

    // ✅ CHANGE: Use server.listen() instead of app.listen()
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth Routes: http://localhost:${PORT}/api/auth/*`);
      console.log(`🌊 Vibe Routes: http://localhost:${PORT}/api/vibes/*`);
      console.log(`👥 User Routes: http://localhost:${PORT}/api/users/*`);
      console.log(
        `💬 Comment Routes: http://localhost:${PORT}/api/vibes/*/comments`,
      );
      console.log(`💭 Chat Routes: http://localhost:${PORT}/api/chat/*`);
      console.log(`🔌 Socket.io ready at http://localhost:${PORT}/socket.io/`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("Shutting down gracefully...");
  redis.disconnect();
  server.close(() => {
    console.log("Server closed");
  });
});

process.on("SIGINT", () => {
  console.log("Shutting down gracefully...");
  redis.disconnect();
  server.close(() => {
    console.log("Server closed");
  });
});
