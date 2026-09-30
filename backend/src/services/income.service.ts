import crypto from "crypto";
import { getDb } from "../database/connection.js";
import { Income, IncomeSource } from "../types/index.js";

function mapIncomeRow(row: any): Income {
  const inc: Income = {
    id: row.id,
    user_id: row.user_id,
    source_id: row.source_id,
    income_source: row.income_source || "other",
    deposit_status: row.deposit_status || "received",
    amount: Number(row.amount),
    currency: row.currency,
    description: row.description,
    date: row.date,
    is_recurring: Boolean(row.is_recurring),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };

  if (row.src_id) {
    inc.source = {
      id: row.src_id,
      user_id: row.user_id,
      name: row.src_name,
      type: row.src_type,
      color: row.src_color,
      created_at: row.src_created_at,
      updated_at: row.src_updated_at,
    };
  }

  return inc;
}

export class IncomeService {
  static async getIncome(
    userId: string,
    filters?: {
      search?: string;
      sourceId?: string;
      income_source?: string;
      deposit_status?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<Income[]> {
    const db = getDb();
    let sql = `
      SELECT 
        i.*,
        s.id as src_id, s.name as src_name, s.type as src_type, s.color as src_color,
        s.created_at as src_created_at, s.updated_at as src_updated_at
      FROM income i
      LEFT JOIN income_sources s ON i.source_id = s.id
      WHERE i.user_id = ?
    `;
    const params: any[] = [userId];

    if (filters?.sourceId) {
      sql += " AND i.source_id = ?";
      params.push(filters.sourceId);
    }
    if (filters?.income_source) {
      sql += " AND i.income_source = ?";
      params.push(filters.income_source);
    }
    if (filters?.deposit_status) {
      sql += " AND i.deposit_status = ?";
      params.push(filters.deposit_status);
    }
    if (filters?.startDate) {
      sql += " AND i.date >= ?";
      params.push(filters.startDate);
    }
    if (filters?.endDate) {
      sql += " AND i.date <= ?";
      params.push(filters.endDate);
    }
    if (filters?.search) {
      sql += " AND (i.description LIKE ? OR s.name LIKE ?)";
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    sql += " ORDER BY i.date DESC, i.created_at DESC";

    const rows = db.prepare(sql).all(...params);
    return rows.map(mapIncomeRow);
  }

  static async getIncomeById(userId: string, id: string): Promise<Income | null> {
    const db = getDb();
    const sql = `
      SELECT 
        i.*,
        s.id as src_id, s.name as src_name, s.type as src_type, s.color as src_color,
        s.created_at as src_created_at, s.updated_at as src_updated_at
      FROM income i
      LEFT JOIN income_sources s ON i.source_id = s.id
      WHERE i.id = ? AND i.user_id = ?
    `;
    const row = db.prepare(sql).get(id, userId);
    return row ? mapIncomeRow(row) : null;
  }

  static async createIncome(userId: string, payload: Partial<Income>): Promise<Income> {
    const db = getDb();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO income (
        id, user_id, source_id, income_source, deposit_status, amount, currency, description,
        date, is_recurring, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      userId,
      payload.source_id || null,
      payload.income_source || "other",
      payload.deposit_status || "received",
      payload.amount,
      payload.currency || "USD",
      payload.description,
      payload.date || now.split("T")[0],
      payload.is_recurring ? 1 : 0,
      now,
      now
    );

    const created = await this.getIncomeById(userId, id);
    if (!created) throw new Error("Failed to create income record.");
    return created;
  }

  static async updateIncome(
    userId: string,
    id: string,
    payload: Partial<Income>
  ): Promise<Income> {
    const db = getDb();
    const existing = await this.getIncomeById(userId, id);
    if (!existing) {
      throw new Error("Income not found or unauthorized access.");
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (payload.source_id !== undefined) {
      fields.push("source_id = ?");
      values.push(payload.source_id || null);
    }
    if (payload.income_source !== undefined) {
      fields.push("income_source = ?");
      values.push(payload.income_source);
    }
    if (payload.deposit_status !== undefined) {
      fields.push("deposit_status = ?");
      values.push(payload.deposit_status);
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
    if (payload.is_recurring !== undefined) {
      fields.push("is_recurring = ?");
      values.push(payload.is_recurring ? 1 : 0);
    }

    fields.push("updated_at = ?");
    values.push(new Date().toISOString());

    values.push(id, userId);

    db.prepare(`UPDATE income SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`).run(...values);

    const updated = await this.getIncomeById(userId, id);
    if (!updated) throw new Error("Failed to retrieve updated income.");
    return updated;
  }

  static async deleteIncome(userId: string, id: string): Promise<void> {
    const db = getDb();
    const result = db.prepare("DELETE FROM income WHERE id = ? AND user_id = ?").run(id, userId);
    if (result.changes === 0) {
      throw new Error("Income not found or unauthorized access.");
    }
  }

  static async getSources(userId: string): Promise<IncomeSource[]> {
    const db = getDb();
    return db
      .prepare("SELECT * FROM income_sources WHERE user_id = ? ORDER BY name ASC")
      .all(userId) as IncomeSource[];
  }

  static async createSource(
    userId: string,
    payload: { name: string; type: string; color: string }
  ): Promise<IncomeSource> {
    const db = getDb();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO income_sources (id, user_id, name, type, color, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, userId, payload.name, payload.type, payload.color, now, now);

    return {
      id,
      user_id: userId,
      name: payload.name,
      type: payload.type,
      color: payload.color,
      created_at: now,
      updated_at: now,
    };
  }
}
