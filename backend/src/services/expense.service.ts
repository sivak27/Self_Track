import crypto from "crypto";
import { getDb } from "../database/connection.js";
import { Expense, ExpenseCategory } from "../types/index.js";

function mapExpenseRow(row: any): Expense {
  const expense: Expense = {
    id: row.id,
    user_id: row.user_id,
    category_id: row.category_id,
    amount: Number(row.amount),
    currency: row.currency,
    description: row.description,
    date: row.date,
    payment_method: row.payment_method,
    is_recurring: Boolean(row.is_recurring),
    receipt_url: row.receipt_url,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };

  if (row.cat_id) {
    expense.category = {
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

  return expense;
}

export class ExpenseService {
  static async getExpenses(
    userId: string,
    filters?: {
      search?: string;
      categoryId?: string;
      startDate?: string;
      endDate?: string;
      paymentMethod?: string;
    }
  ): Promise<Expense[]> {
    const db = getDb();
    let sql = `
      SELECT 
        e.*,
        c.id as cat_id, c.name as cat_name, c.color as cat_color, c.icon as cat_icon, 
        c.is_default as cat_is_default, c.created_at as cat_created_at, c.updated_at as cat_updated_at
      FROM expenses e
      LEFT JOIN expense_categories c ON e.category_id = c.id
      WHERE e.user_id = ?
    `;
    const params: any[] = [userId];

    if (filters?.categoryId) {
      sql += " AND e.category_id = ?";
      params.push(filters.categoryId);
    }
    if (filters?.paymentMethod) {
      sql += " AND e.payment_method = ?";
      params.push(filters.paymentMethod);
    }
    if (filters?.startDate) {
      sql += " AND e.date >= ?";
      params.push(filters.startDate);
    }
    if (filters?.endDate) {
      sql += " AND e.date <= ?";
      params.push(filters.endDate);
    }
    if (filters?.search) {
      sql += " AND e.description LIKE ?";
      params.push(`%${filters.search}%`);
    }

    sql += " ORDER BY e.date DESC, e.created_at DESC";

    const rows = db.prepare(sql).all(...params);
    return rows.map(mapExpenseRow);
  }

  static async getExpenseById(userId: string, id: string): Promise<Expense | null> {
    const db = getDb();
    const sql = `
      SELECT 
        e.*,
        c.id as cat_id, c.name as cat_name, c.color as cat_color, c.icon as cat_icon, 
        c.is_default as cat_is_default, c.created_at as cat_created_at, c.updated_at as cat_updated_at
      FROM expenses e
      LEFT JOIN expense_categories c ON e.category_id = c.id
      WHERE e.id = ? AND e.user_id = ?
    `;
    const row = db.prepare(sql).get(id, userId);
    return row ? mapExpenseRow(row) : null;
  }

  static async createExpense(userId: string, payload: Partial<Expense>): Promise<Expense> {
    const db = getDb();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO expenses (
        id, user_id, category_id, amount, currency, description,
        date, payment_method, is_recurring, receipt_url, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      userId,
      payload.category_id || null,
      payload.amount,
      payload.currency || "USD",
      payload.description,
      payload.date || now.split("T")[0],
      payload.payment_method || "credit_card",
      payload.is_recurring ? 1 : 0,
      payload.receipt_url || null,
      now,
      now
    );

    const created = await this.getExpenseById(userId, id);
    if (!created) throw new Error("Failed to create expense record.");
    return created;
  }

  static async updateExpense(
    userId: string,
    id: string,
    payload: Partial<Expense>
  ): Promise<Expense> {
    const db = getDb();
    const existing = await this.getExpenseById(userId, id);
    if (!existing) {
      throw new Error("Expense not found or unauthorized access.");
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (payload.category_id !== undefined) {
      fields.push("category_id = ?");
      values.push(payload.category_id || null);
    }
    if (payload.amount !== undefined) {
      fields.push("amount = ?");
      values.push(payload.amount);
    }
    if (payload.currency !== undefined) {
      fields.push("currency = ?");
      values.push(payload.currency);
    }
    if (payload.description !== undefined) {
      fields.push("description = ?");
      values.push(payload.description);
    }
    if (payload.date !== undefined) {
      fields.push("date = ?");
      values.push(payload.date);
    }
    if (payload.payment_method !== undefined) {
      fields.push("payment_method = ?");
      values.push(payload.payment_method);
    }
    if (payload.is_recurring !== undefined) {
      fields.push("is_recurring = ?");
      values.push(payload.is_recurring ? 1 : 0);
    }
    if (payload.receipt_url !== undefined) {
      fields.push("receipt_url = ?");
      values.push(payload.receipt_url);
    }

    fields.push("updated_at = ?");
    values.push(new Date().toISOString());

    values.push(id, userId);

    db.prepare(`UPDATE expenses SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`).run(...values);

    const updated = await this.getExpenseById(userId, id);
    if (!updated) throw new Error("Failed to retrieve updated expense.");
    return updated;
  }

  static async deleteExpense(userId: string, id: string): Promise<void> {
    const db = getDb();
    const result = db.prepare("DELETE FROM expenses WHERE id = ? AND user_id = ?").run(id, userId);
    if (result.changes === 0) {
      throw new Error("Expense not found or unauthorized access.");
    }
  }

  static async getCategories(userId: string): Promise<ExpenseCategory[]> {
    const db = getDb();
    const rows = db
      .prepare("SELECT * FROM expense_categories WHERE user_id = ? ORDER BY name ASC")
      .all(userId) as any[];

    return rows.map((r) => ({
      ...r,
      is_default: Boolean(r.is_default),
    }));
  }

  static async createCategory(
    userId: string,
    payload: { name: string; color: string; icon: string }
  ): Promise<ExpenseCategory> {
    const db = getDb();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO expense_categories (id, user_id, name, color, icon, is_default, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 0, ?, ?)
    `).run(id, userId, payload.name, payload.color, payload.icon, now, now);

    return {
      id,
      user_id: userId,
      name: payload.name,
      color: payload.color,
      icon: payload.icon,
      is_default: false,
      created_at: now,
      updated_at: now,
    };
  }
}
