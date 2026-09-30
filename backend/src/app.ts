import express, { Express, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import apiRouter from "./routes/index.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { env } from "./config/env.js";

export function createApp(): Express {
  const app = express();

  // CORS configuration allowing requests from frontend
  app.use(
    cors({
      origin: [env.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Body parser & Cookie parser
  app.use(express.json());
  app.use(cookieParser());

  // Health check
  app.get("/health", (req: Request, res: Response) => {
    res.json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/api/health", (req: Request, res: Response) => {
    res.json({
      status: "ok",
    });
  });

  // Mount API endpoints
  app.use("/api", apiRouter);

  // 404 handler for undefined API routes
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: `API route not found: ${req.method} ${req.originalUrl}`,
    });
  });

  // Global centralized error middleware
  app.use(errorHandler);

  return app;
}
