import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof ZodError) {
    const formattedErrors: Record<string, string> = {};
    err.issues.forEach((issue) => {
      const field = issue.path.join(".");
      formattedErrors[field] = issue.message;
    });

    res.status(400).json({
      success: false,
      error: "Validation failed",
      data: formattedErrors,
    });
    return;
  }

  if (err instanceof Error) {
    const msg = err.message.toLowerCase();

    // 409 Conflict: Duplicates
    if (msg.includes("already exists") || msg.includes("unique constraint failed")) {
      res.status(409).json({
        success: false,
        error: err.message,
      });
      return;
    }

    // 401 Unauthorized: Invalid credentials or token
    if (msg.includes("invalid email or password") || msg.includes("unauthorized") || msg.includes("token")) {
      res.status(401).json({
        success: false,
        error: err.message,
      });
      return;
    }

    // 403 Forbidden: Access denied
    if (msg.includes("forbidden") || msg.includes("access denied")) {
      res.status(403).json({
        success: false,
        error: err.message,
      });
      return;
    }

    // 404 Not Found
    if (msg.includes("not found")) {
      res.status(404).json({
        success: false,
        error: err.message,
      });
      return;
    }

    // 400 Bad Request
    if (msg.includes("invalid") || msg.includes("required") || msg.includes("must be")) {
      res.status(400).json({
        success: false,
        error: err.message,
      });
      return;
    }

    // Centralized 500 error logging without exposing stack trace to users
    console.error("Internal Server Error:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Internal server error",
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: "An unexpected error occurred",
  });
}
