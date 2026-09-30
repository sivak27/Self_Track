import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { getDb } from "../database/connection.js";
import { env } from "../config/env.js";
import { AuthUser, Profile, UserSettings } from "../types/index.js";

export class AuthService {
  static async register(
    email: string,
    password: string,
    fullName?: string
  ): Promise<{
    user: AuthUser;
    token: string;
    profile: Profile;
    settings: UserSettings;
  }> {
    const db = getDb();
    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = db
      .prepare("SELECT id FROM users WHERE lower(email) = ?")
      .get(cleanEmail) as { id: string } | undefined;

    if (existing) {
      throw new Error("A user with this email address already exists.");
    }

    const userId = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();
    const settingsId = crypto.randomUUID();

    // Transaction for user provisioning
    const registerTx = db.transaction(() => {
      // 1. Insert user
      db.prepare(
        "INSERT INTO users (id, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)"
      ).run(userId, cleanEmail, passwordHash, now, now);

      // 2. Insert profile
      db.prepare(
        "INSERT INTO profiles (id, email, full_name, avatar_url, currency, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).run(userId, cleanEmail, fullName || "", null, "USD", now, now);

      // 3. Insert user_settings
      db.prepare(
        "INSERT INTO user_settings (id, user_id, currency, date_format, theme, email_notifications, weekly_summary_enabled, budget_alert_notifications, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      ).run(settingsId, userId, "USD", "YYYY-MM-DD", "light", 1, 1, 1, now, now);

      // 4. Seed default expense categories
      const defaultCategories = [
        { name: "Housing & Rent", color: "#4F46E5", icon: "Home" },
        { name: "Groceries & Food", color: "#16A34A", icon: "Utensils" },
        { name: "Transportation", color: "#D97706", icon: "Car" },
        { name: "Utilities & Bills", color: "#9333EA", icon: "Zap" },
        { name: "Entertainment", color: "#DB2777", icon: "Film" },
        { name: "Health & Fitness", color: "#0284C7", icon: "Activity" },
        { name: "Personal & Shopping", color: "#4F46E5", icon: "ShoppingBag" },
        { name: "Other", color: "#64748B", icon: "MoreHorizontal" },
      ];

      const catStmt = db.prepare(
        "INSERT INTO expense_categories (id, user_id, name, color, icon, is_default, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      );

      for (const cat of defaultCategories) {
        catStmt.run(crypto.randomUUID(), userId, cat.name, cat.color, cat.icon, 1, now, now);
      }

      // 5. Seed default income sources (8 distinct sources)
      const defaultSources = [
        { name: "Primary Salary", type: "salary", color: "#16A34A" },
        { name: "Part-time", type: "part_time", color: "#0D9488" },
        { name: "Freelance / Consulting", type: "freelance", color: "#4F46E5" },
        { name: "Friends", type: "friends", color: "#EA580C" },
        { name: "Investments & Dividends", type: "investments", color: "#0284C7" },
        { name: "Business", type: "business", color: "#9333EA" },
        { name: "Gift", type: "gift", color: "#EC4899" },
        { name: "Other", type: "other", color: "#64748B" },
      ];

      const srcStmt = db.prepare(
        "INSERT INTO income_sources (id, user_id, name, type, color, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
      );

      for (const src of defaultSources) {
        srcStmt.run(crypto.randomUUID(), userId, src.name, src.type, src.color, now, now);
      }
    });

    registerTx();

    const token = jwt.sign({ userId, email: cleanEmail }, env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const profile = db.prepare("SELECT * FROM profiles WHERE id = ?").get(userId) as Profile;
    const rawSettings = db.prepare("SELECT * FROM user_settings WHERE user_id = ?").get(userId) as any;
    const settings: UserSettings = {
      ...rawSettings,
      email_notifications: Boolean(rawSettings.email_notifications),
      weekly_summary_enabled: Boolean(rawSettings.weekly_summary_enabled),
      budget_alert_notifications: Boolean(rawSettings.budget_alert_notifications),
    };

    return {
      user: { id: userId, email: cleanEmail },
      token,
      profile,
      settings,
    };
  }

  static async login(
    email: string,
    password: string
  ): Promise<{
    user: AuthUser;
    token: string;
    profile: Profile;
    settings: UserSettings;
  }> {
    const db = getDb();
    const cleanEmail = email.trim().toLowerCase();

    const user = db
      .prepare("SELECT id, email, password_hash FROM users WHERE lower(email) = ?")
      .get(cleanEmail) as { id: string; email: string; password_hash: string } | undefined;

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error("Invalid email or password.");
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const profile = (db.prepare("SELECT * FROM profiles WHERE id = ?").get(user.id) || {
      id: user.id,
      email: user.email,
      full_name: "",
      avatar_url: null,
      currency: "USD",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }) as Profile;

    const rawSettings = db.prepare("SELECT * FROM user_settings WHERE user_id = ?").get(user.id) as any;
    const settings: UserSettings = rawSettings
      ? {
          ...rawSettings,
          email_notifications: Boolean(rawSettings.email_notifications),
          weekly_summary_enabled: Boolean(rawSettings.weekly_summary_enabled),
          budget_alert_notifications: Boolean(rawSettings.budget_alert_notifications),
        }
      : {
          id: "",
          user_id: user.id,
          currency: "USD",
          date_format: "YYYY-MM-DD",
          theme: "light",
          email_notifications: true,
          weekly_summary_enabled: true,
          budget_alert_notifications: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

    return {
      user: { id: user.id, email: user.email },
      token,
      profile,
      settings,
    };
  }

  static async getCurrentUser(
    userId: string
  ): Promise<{
    user: AuthUser;
    profile: Profile;
    settings: UserSettings;
  } | null> {
    const db = getDb();
    const user = db
      .prepare("SELECT id, email FROM users WHERE id = ?")
      .get(userId) as { id: string; email: string } | undefined;

    if (!user) return null;

    const profile = (db.prepare("SELECT * FROM profiles WHERE id = ?").get(user.id) || {
      id: user.id,
      email: user.email,
      full_name: "",
      avatar_url: null,
      currency: "USD",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }) as Profile;

    const rawSettings = db.prepare("SELECT * FROM user_settings WHERE user_id = ?").get(user.id) as any;
    const settings: UserSettings = rawSettings
      ? {
          ...rawSettings,
          email_notifications: Boolean(rawSettings.email_notifications),
          weekly_summary_enabled: Boolean(rawSettings.weekly_summary_enabled),
          budget_alert_notifications: Boolean(rawSettings.budget_alert_notifications),
        }
      : {
          id: "",
          user_id: user.id,
          currency: "USD",
          date_format: "YYYY-MM-DD",
          theme: "light",
          email_notifications: true,
          weekly_summary_enabled: true,
          budget_alert_notifications: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

    return {
      user: { id: user.id, email: user.email },
      profile,
      settings,
    };
  }

  static async resetPassword(email: string, newPassword?: string): Promise<{ success: boolean; message: string }> {
    const db = getDb();
    const cleanEmail = email.trim().toLowerCase();

    const user = db
      .prepare("SELECT id FROM users WHERE lower(email) = ?")
      .get(cleanEmail) as { id: string } | undefined;

    if (!user) {
      throw new Error("No registered account found with this email address.");
    }

    if (!newPassword) {
      return {
        success: true,
        message: "Account verified. Please specify your new password to reset.",
      };
    }

    if (newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters.");
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const now = new Date().toISOString();
    db.prepare("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?").run(passwordHash, now, user.id);

    return {
      success: true,
      message: "Password successfully updated. You may now sign in with your new credentials.",
    };
  }
}
