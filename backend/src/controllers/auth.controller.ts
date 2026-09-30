import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service.js";
import { registerSchema, loginSchema, resetPasswordSchema } from "../validators/index.js";
import { env } from "../config/env.js";

const COOKIE_NAME = "auth_token";

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = registerSchema.parse(req.body);
      const result = await AuthService.register(
        validated.email,
        validated.password,
        validated.fullName
      );

      res.cookie(COOKIE_NAME, result.token, cookieOptions);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await AuthService.login(validated.email, validated.password);

      res.cookie(COOKIE_NAME, result.token, cookieOptions);
      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        sameSite: "lax",
      });
      res.json({
        success: true,
        message: "Successfully logged out.",
      });
    } catch (err) {
      next(err);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const data = await AuthService.getCurrentUser(user.id);

      if (!data) {
        res.status(401).json({
          success: false,
          error: "User not found or session invalid.",
        });
        return;
      }

      res.json({
        success: true,
        data: {
          user: data.user,
          profile: data.profile,
          settings: data.settings,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = resetPasswordSchema.parse(req.body);
      const result = await AuthService.resetPassword(validated.email, validated.newPassword);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}
