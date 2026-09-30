import crypto from "crypto";
import { getDb } from "../database/connection.js";
import { Goal } from "../types/index.js";

function mapGoalRow(row: any): Goal {
  const current = Number(row.current_value) || 0;
  const target = Number(row.target_value) || 1;
  const progress_pct = Math.min(100, Math.round((current / target) * 100));

  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    description: row.description,
    category: row.category,
    target_value: target,
    current_value: current,
    unit: row.unit,
    target_date: row.target_date,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    progress_pct,
  };
}

export class GoalService {
  static async getGoals(userId: string): Promise<Goal[]> {
    const db = getDb();
    const rows = db
      .prepare("SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC")
      .all(userId) as any[];

    return rows.map(mapGoalRow);
  }

  static async getGoalById(userId: string, id: string): Promise<Goal | null> {
    const db = getDb();
    const row = db
      .prepare("SELECT * FROM goals WHERE id = ? AND user_id = ?")
      .get(id, userId) as any;

    return row ? mapGoalRow(row) : null;
  }

  static async createGoal(userId: string, payload: Partial<Goal>): Promise<Goal> {
    const db = getDb();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO goals (
        id, user_id, title, description, category, target_value,
        current_value, unit, target_date, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      userId,
      payload.title,
      payload.description || null,
      payload.category || "personal",
      payload.target_value,
      payload.current_value || 0,
      payload.unit || "$",
      payload.target_date || null,
      payload.status || "in_progress",
      now,
      now
    );

    const created = await this.getGoalById(userId, id);
    if (!created) throw new Error("Failed to create goal record.");
    return created;
  }

  static async updateGoal(
    userId: string,
    id: string,
    payload: Partial<Goal>
  ): Promise<Goal> {
    const db = getDb();
    const existing = await this.getGoalById(userId, id);
    if (!existing) {
      throw new Error("Goal not found or unauthorized access.");
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (payload.title !== undefined) {
      fields.push("title = ?");
      values.push(payload.title);
    }
    if (payload.description !== undefined) {
      fields.push("description = ?");
      values.push(payload.description);
    }
    if (payload.category !== undefined) {
      fields.push("category = ?");
      values.push(payload.category);
    }
    if (payload.target_value !== undefined) {
      fields.push("target_value = ?");
      values.push(payload.target_value);
    }
    if (payload.current_value !== undefined) {
      fields.push("current_value = ?");
      values.push(payload.current_value);
    }
    if (payload.unit !== undefined) {
      fields.push("unit = ?");
      values.push(payload.unit);
    }
    if (payload.target_date !== undefined) {
      fields.push("target_date = ?");
      values.push(payload.target_date);
    }
    if (payload.status !== undefined) {
      fields.push("status = ?");
      values.push(payload.status);
    }

    fields.push("updated_at = ?");
    values.push(new Date().toISOString());

    values.push(id, userId);

    db.prepare(`UPDATE goals SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`).run(...values);

    const updated = await this.getGoalById(userId, id);
    if (!updated) throw new Error("Failed to retrieve updated goal.");
    return updated;
  }

  static async incrementGoalProgress(
    userId: string,
    id: string,
    delta: number
  ): Promise<Goal> {
    const db = getDb();
    const goal = await this.getGoalById(userId, id);
    if (!goal) {
      throw new Error("Goal not found or unauthorized access.");
    }

    const newCurrent = Math.max(0, goal.current_value + delta);
    const isNowAchieved = newCurrent >= goal.target_value;
    const newStatus = isNowAchieved ? "achieved" : goal.status;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE goals 
      SET current_value = ?, status = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `).run(newCurrent, newStatus, now, id, userId);

    const updated = await this.getGoalById(userId, id);
    if (!updated) throw new Error("Failed to retrieve updated goal.");
    return updated;
  }

  static async deleteGoal(userId: string, id: string): Promise<void> {
    const db = getDb();
    const result = db.prepare("DELETE FROM goals WHERE id = ? AND user_id = ?").run(id, userId);
    if (result.changes === 0) {
      throw new Error("Goal not found or unauthorized access.");
    }
  }
}
