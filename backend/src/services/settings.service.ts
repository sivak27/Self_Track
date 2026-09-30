import { getDb } from "../database/connection.js";
import { Profile, UserSettings } from "../types/index.js";

export class SettingsService {
  static async getSettings(userId: string): Promise<{ profile: Profile; settings: UserSettings }> {
    const db = getDb();

    let profile = db.prepare("SELECT * FROM profiles WHERE id = ?").get(userId) as Profile | undefined;
    if (!profile) {
      const now = new Date().toISOString();
      const user = db.prepare("SELECT email FROM users WHERE id = ?").get(userId) as { email: string } | undefined;
      db.prepare(`
        INSERT INTO profiles (id, email, full_name, avatar_url, currency, created_at, updated_at)
        VALUES (?, ?, '', NULL, 'USD', ?, ?)
      `).run(userId, user?.email || "", now, now);
      profile = db.prepare("SELECT * FROM profiles WHERE id = ?").get(userId) as Profile;
    }

    let rawSettings = db.prepare("SELECT * FROM user_settings WHERE user_id = ?").get(userId) as any;
    if (!rawSettings) {
      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO user_settings (
          id, user_id, currency, date_format, theme, email_notifications,
          weekly_summary_enabled, budget_alert_notifications, created_at, updated_at
        ) VALUES (?, ?, 'USD', 'YYYY-MM-DD', 'light', 1, 1, 1, ?, ?)
      `).run(userId, userId, now, now);
      rawSettings = db.prepare("SELECT * FROM user_settings WHERE user_id = ?").get(userId) as any;
    }

    const settings: UserSettings = {
      ...rawSettings,
      email_notifications: Boolean(rawSettings.email_notifications),
      weekly_summary_enabled: Boolean(rawSettings.weekly_summary_enabled),
      budget_alert_notifications: Boolean(rawSettings.budget_alert_notifications),
    };

    return { profile, settings };
  }

  static async updateSettings(
    userId: string,
    payload: {
      full_name?: string;
      currency?: string;
      date_format?: string;
      theme?: "dark" | "light" | "system";
      email_notifications?: boolean;
      weekly_summary_enabled?: boolean;
      budget_alert_notifications?: boolean;
    }
  ): Promise<{ profile: Profile; settings: UserSettings }> {
    const db = getDb();
    const now = new Date().toISOString();

    if (payload.full_name !== undefined || payload.currency !== undefined) {
      const profileFields: string[] = ["updated_at = ?"];
      const profileValues: any[] = [now];

      if (payload.full_name !== undefined) {
        profileFields.push("full_name = ?");
        profileValues.push(payload.full_name);
      }
      if (payload.currency !== undefined) {
        profileFields.push("currency = ?");
        profileValues.push(payload.currency);
      }

      profileValues.push(userId);
      db.prepare(`UPDATE profiles SET ${profileFields.join(", ")} WHERE id = ?`).run(...profileValues);
    }

    const settingsFields: string[] = [];
    const settingsValues: any[] = [];

    if (payload.currency !== undefined) {
      settingsFields.push("currency = ?");
      settingsValues.push(payload.currency);
    }
    if (payload.date_format !== undefined) {
      settingsFields.push("date_format = ?");
      settingsValues.push(payload.date_format);
    }
    if (payload.theme !== undefined) {
      settingsFields.push("theme = ?");
      settingsValues.push(payload.theme);
    }
    if (payload.email_notifications !== undefined) {
      settingsFields.push("email_notifications = ?");
      settingsValues.push(payload.email_notifications ? 1 : 0);
    }
    if (payload.weekly_summary_enabled !== undefined) {
      settingsFields.push("weekly_summary_enabled = ?");
      settingsValues.push(payload.weekly_summary_enabled ? 1 : 0);
    }
    if (payload.budget_alert_notifications !== undefined) {
      settingsFields.push("budget_alert_notifications = ?");
      settingsValues.push(payload.budget_alert_notifications ? 1 : 0);
    }

    if (settingsFields.length > 0) {
      settingsFields.push("updated_at = ?");
      settingsValues.push(now);

      settingsValues.push(userId);
      db.prepare(`UPDATE user_settings SET ${settingsFields.join(", ")} WHERE user_id = ?`).run(...settingsValues);
    }

    return this.getSettings(userId);
  }

  static async exportAllData(userId: string): Promise<Record<string, unknown>> {
    const db = getDb();

    const profile = db.prepare("SELECT * FROM profiles WHERE id = ?").get(userId) || null;
    const settings = db.prepare("SELECT * FROM user_settings WHERE user_id = ?").get(userId) || null;
    const expenseCategories = db.prepare("SELECT * FROM expense_categories WHERE user_id = ?").all(userId);
    const expenses = db.prepare("SELECT * FROM expenses WHERE user_id = ?").all(userId);
    const incomeSources = db.prepare("SELECT * FROM income_sources WHERE user_id = ?").all(userId);
    const income = db.prepare("SELECT * FROM income WHERE user_id = ?").all(userId);
    const budgets = db.prepare("SELECT * FROM budgets WHERE user_id = ?").all(userId);
    const projects = db.prepare("SELECT * FROM projects WHERE user_id = ?").all(userId);
    const tasks = db.prepare("SELECT * FROM tasks WHERE user_id = ?").all(userId);
    const goals = db.prepare("SELECT * FROM goals WHERE user_id = ?").all(userId);

    return {
      metadata: {
        exported_at: new Date().toISOString(),
        user_id: userId,
        application: "Personal Control Center",
        version: "2.0.0",
        storage: "SQLite Local Database",
      },
      profile,
      settings,
      expenseCategories,
      expenses,
      incomeSources,
      income,
      budgets,
      projects,
      tasks,
      goals,
    };
  }
}
