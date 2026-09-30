import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

interface DecodedToken {
  userId: string;
  email: string;
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    let token: string | undefined;

    // 1. Check Authorization Bearer header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // 2. Fallback to HTTP-only cookie if header not provided
    if (!token && (req as any).cookies?.auth_token) {
      token = (req as any).cookies.auth_token;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: "Unauthorized: Missing authentication token",
      });
      return;
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as DecodedToken;
      req.user = {
        id: decoded.userId,
        email: decoded.email,
      };
      req.token = token;
      next();
    } catch (jwtErr) {
      res.status(401).json({
        success: false,
        error: "Unauthorized: Invalid or expired session token",
      });
    }
  } catch (err: unknown) {
    res.status(500).json({
      success: false,
      error: "Authentication service internal failure",
    });
  }
}
