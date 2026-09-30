import dotenv from "dotenv";
import path from "path";

dotenv.config();

export const env = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  DATABASE_PATH: process.env.DATABASE_PATH || path.resolve(process.cwd(), "../database/personal-control-center.db"),
  JWT_SECRET: process.env.JWT_SECRET || "personal-control-center-jwt-secret-key-32chars",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
};
