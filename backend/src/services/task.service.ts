import crypto from "crypto";
import { getDb } from "../database/connection.js";
import { Task } from "../types/index.js";

function mapTaskRow(row: any): Task {
  const task: Task = {
    id: row.id,
    user_id: row.user_id,
    project_id: row.project_id,
    goal_id: row.goal_id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    due_date: row.due_date,
    estimated_minutes: row.estimated_minutes !== null ? Number(row.estimated_minutes) : null,
    actual_minutes: row.actual_minutes !== null ? Number(row.actual_minutes) : null,
    completed_at: row.completed_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };

  if (row.proj_id) {
    task.project = {
      id: row.proj_id,
      user_id: row.user_id,
      title: row.proj_title,
      description: row.proj_description,
      status: row.proj_status,
      priority: row.proj_priority,
      color: row.proj_color,
      start_date: row.proj_start_date,
      target_date: row.proj_target_date,
      created_at: row.proj_created_at,
      updated_at: row.proj_updated_at,
    };
  }

  return task;
}

export class TaskService {
  static async getTasks(
    userId: string,
    filters?: {
      projectId?: string;
      status?: string;
      priority?: string;
      search?: string;
    }
  ): Promise<Task[]> {
    const db = getDb();
    let sql = `
      SELECT 
        t.*,
        p.id as proj_id, p.title as proj_title, p.description as proj_description,
        p.status as proj_status, p.priority as proj_priority, p.color as proj_color,
        p.start_date as proj_start_date, p.target_date as proj_target_date,
        p.created_at as proj_created_at, p.updated_at as proj_updated_at
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.user_id = ?
    `;
    const params: any[] = [userId];

    if (filters?.projectId) {
      sql += " AND t.project_id = ?";
      params.push(filters.projectId);
    }
    if (filters?.status) {
      sql += " AND t.status = ?";
      params.push(filters.status);
    }
    if (filters?.priority) {
      sql += " AND t.priority = ?";
      params.push(filters.priority);
    }
    if (filters?.search) {
      sql += " AND (t.title LIKE ? OR t.description LIKE ?)";
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    sql += " ORDER BY t.created_at DESC";

    const rows = db.prepare(sql).all(...params);
    return rows.map(mapTaskRow);
  }

  static async getTaskById(userId: string, id: string): Promise<Task | null> {
    const db = getDb();
    const sql = `
      SELECT 
        t.*,
        p.id as proj_id, p.title as proj_title, p.description as proj_description,
        p.status as proj_status, p.priority as proj_priority, p.color as proj_color,
        p.start_date as proj_start_date, p.target_date as proj_target_date,
        p.created_at as proj_created_at, p.updated_at as proj_updated_at
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.id = ? AND t.user_id = ?
    `;
    const row = db.prepare(sql).get(id, userId);
    return row ? mapTaskRow(row) : null;
  }

  static async createTask(userId: string, payload: Partial<Task>): Promise<Task> {
    const db = getDb();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const completed_at = payload.status === "completed" ? now : null;

    db.prepare(`
      INSERT INTO tasks (
        id, user_id, project_id, goal_id, title, description,
        status, priority, due_date, estimated_minutes, actual_minutes,
        completed_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      userId,
      payload.project_id || null,
      payload.goal_id || null,
      payload.title,
      payload.description || null,
      payload.status || "todo",
      payload.priority || "medium",
      payload.due_date || null,
      payload.estimated_minutes !== undefined ? payload.estimated_minutes : null,
      payload.actual_minutes !== undefined ? payload.actual_minutes : null,
      completed_at,
      now,
      now
    );

    const created = await this.getTaskById(userId, id);
    if (!created) throw new Error("Failed to create task record.");
    return created;
  }

  static async updateTask(
    userId: string,
    id: string,
    payload: Partial<Task>
  ): Promise<Task> {
    const db = getDb();
    const existing = await this.getTaskById(userId, id);
    if (!existing) {
      throw new Error("Task not found or unauthorized access.");
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (payload.project_id !== undefined) {
      fields.push("project_id = ?");
      values.push(payload.project_id || null);
    }
    if (payload.goal_id !== undefined) {
      fields.push("goal_id = ?");
      values.push(payload.goal_id || null);
    }
    if (payload.title !== undefined) {
      fields.push("title = ?");
      values.push(payload.title);
    }
    if (payload.description !== undefined) {
      fields.push("description = ?");
      values.push(payload.description);
    }
    if (payload.status !== undefined) {
      fields.push("status = ?");
      values.push(payload.status);
      fields.push("completed_at = ?");
      values.push(payload.status === "completed" ? new Date().toISOString() : null);
    }
    if (payload.priority !== undefined) {
      fields.push("priority = ?");
      values.push(payload.priority);
    }
    if (payload.due_date !== undefined) {
      fields.push("due_date = ?");
      values.push(payload.due_date);
    }
    if (payload.estimated_minutes !== undefined) {
      fields.push("estimated_minutes = ?");
      values.push(payload.estimated_minutes);
    }
    if (payload.actual_minutes !== undefined) {
      fields.push("actual_minutes = ?");
      values.push(payload.actual_minutes);
    }

    fields.push("updated_at = ?");
    values.push(new Date().toISOString());

    values.push(id, userId);

    db.prepare(`UPDATE tasks SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`).run(...values);

    const updated = await this.getTaskById(userId, id);
    if (!updated) throw new Error("Failed to retrieve updated task.");
    return updated;
  }

  static async deleteTask(userId: string, id: string): Promise<void> {
    const db = getDb();
    const result = db.prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?").run(id, userId);
    if (result.changes === 0) {
      throw new Error("Task not found or unauthorized access.");
    }
  }
}
