import crypto from "crypto";
import { getDb } from "../database/connection.js";
import { Budget } from "../types/index.js";

function mapBudgetRow(row: any, expenses: any[]): Budget {
  const budgetAmount = Number(row.amount) || 0;

  // Filter relevant expenses for utilization calculation
  const relevantExpenses = expenses.filter((e) => {
    if (e.category_id !== row.category_id) return false;
    if (row.start_date && e.date < row.start_date) return false;
    if (row.end_date && e.date > row.end_date) return false;
    return true;
  });

  const spent = relevantExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const percentage = budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;

  const budget: Budget = {
    id: row.id,
    user_id: row.user_id,
    category_id: row.category_id,
    amount: budgetAmount,
    period: row.period,
    start_date: row.start_date,
    end_date: row.end_date,
    alert_threshold: Number(row.alert_threshold),
    created_at: row.created_at,
    updated_at: row.updated_at,
    spent,
    percentage,
  };

  if (row.cat_id) {
    budget.category = {
      id: row.cat_id,
      user_id: row.user_id,
      name: row.cat_name,
      color: row.cat_color,
      icon: row.cat_icon,
      is_default: Boolean(row.cat_is_default),
      created_at: row.cat_created_at,
      updated_at: row.cat_updated_at,
    };
  }

  return budget;
}

export class BudgetService {
  static async getBudgets(userId: string): Promise<Budget[]> {
    const db = getDb();
    const budgetRows = db
      .prepare(`
        SELECT 
          b.*,
          c.id as cat_id, c.name as cat_name, c.color as cat_color, c.icon as cat_icon,
          c.is_default as cat_is_default, c.created_at as cat_created_at, c.updated_at as cat_updated_at
        FROM budgets b
        LEFT JOIN expense_categories c ON b.category_id = c.id
        WHERE b.user_id = ?
        ORDER BY b.created_at DESC
      `)
      .all(userId) as any[];

    if (!budgetRows || budgetRows.length === 0) return [];

    const expenses = db
      .prepare("SELECT category_id, amount, date FROM expenses WHERE user_id = ?")
      .all(userId) as any[];

    return budgetRows.map((b) => mapBudgetRow(b, expenses));
  }

  static async getBudgetById(userId: string, id: string): Promise<Budget | null> {
    const db = getDb();
    const row = db
      .prepare(`
        SELECT 
          b.*,
          c.id as cat_id, c.name as cat_name, c.color as cat_color, c.icon as cat_icon,
          c.is_default as cat_is_default, c.created_at as cat_created_at, c.updated_at as cat_updated_at
        FROM budgets b
        LEFT JOIN expense_categories c ON b.category_id = c.id
        WHERE b.id = ? AND b.user_id = ?
      `)
      .get(id, userId) as any;

    if (!row) return null;

    const expenses = db
      .prepare("SELECT category_id, amount, date FROM expenses WHERE user_id = ?")
      .all(userId) as any[];

    return mapBudgetRow(row, expenses);
  }

  static async createBudget(userId: string, payload: Partial<Budget>): Promise<Budget> {
    const db = getDb();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO budgets (
        id, user_id, category_id, amount, period, start_date, end_date,
        alert_threshold, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      userId,
      payload.category_id,
      payload.amount,
      payload.period || "monthly",
      payload.start_date || now.split("T")[0],
      payload.end_date || null,
      payload.alert_threshold || 80,
      now,
      now
    );

    const created = await this.getBudgetById(userId, id);
    if (!created) throw new Error("Failed to create budget record.");
    return created;
  }

  static async updateBudget(
    userId: string,
    id: string,
    payload: Partial<Budget>
  ): Promise<Budget> {
    const db = getDb();
    const existing = await this.getBudgetById(userId, id);
    if (!existing) {
      throw new Error("Budget not found or unauthorized access.");
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (payload.category_id !== undefined) {
      fields.push("category_id = ?");
      values.push(payload.category_id);
    }
    if (payload.amount !== undefined) {
      fields.push("amount = ?");
      values.push(payload.amount);
    }
    if (payload.period !== undefined) {
      fields.push("period = ?");
      values.push(payload.period);
    }
    if (payload.start_date !== undefined) {
      fields.push("start_date = ?");
      values.push(payload.start_date);
    }
    if (payload.end_date !== undefined) {
      fields.push("end_date = ?");
      values.push(payload.end_date);
    }
    if (payload.alert_threshold !== undefined) {
      fields.push("alert_threshold = ?");
      values.push(payload.alert_threshold);
    }

    fields.push("updated_at = ?");
    values.push(new Date().toISOString());

    values.push(id, userId);

    db.prepare(`UPDATE budgets SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`).run(...values);

    const updated = await this.getBudgetById(userId, id);
    if (!updated) throw new Error("Failed to retrieve updated budget.");
    return updated;
  }

  static async deleteBudget(userId: string, id: string): Promise<void> {
    const db = getDb();
    const result = db.prepare("DELETE FROM budgets WHERE id = ? AND user_id = ?").run(id, userId);
    if (result.changes === 0) {
      throw new Error("Budget not found or unauthorized access.");
    }
  }
}
