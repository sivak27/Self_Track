import crypto from "crypto";
import { getDb } from "../database/connection.js";
import { Project } from "../types/index.js";

function mapProjectRow(row: any, tasks: any[]): Project {
  const projectTasks = tasks.filter((t) => t.project_id === row.id);
  const total_tasks = projectTasks.length;
  const completed_tasks = projectTasks.filter((t) => t.status === "completed").length;
  const progress_pct = total_tasks > 0 ? Math.round((completed_tasks / total_tasks) * 100) : 0;

  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    color: row.color,
    start_date: row.start_date,
    target_date: row.target_date,
    created_at: row.created_at,
    updated_at: row.updated_at,
    total_tasks,
    completed_tasks,
    progress_pct,
  };
}

export class ProjectService {
  static async getProjects(userId: string): Promise<Project[]> {
    const db = getDb();
    const projects = db
      .prepare("SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC")
      .all(userId) as any[];

    if (!projects || projects.length === 0) return [];

    const tasks = db
      .prepare("SELECT id, project_id, status FROM tasks WHERE user_id = ? AND project_id IS NOT NULL")
      .all(userId) as any[];

    return projects.map((p) => mapProjectRow(p, tasks));
  }

  static async getProjectById(userId: string, id: string): Promise<Project | null> {
    const db = getDb();
    const row = db
      .prepare("SELECT * FROM projects WHERE id = ? AND user_id = ?")
      .get(id, userId) as any;

    if (!row) return null;

    const tasks = db
      .prepare("SELECT id, project_id, status FROM tasks WHERE user_id = ? AND project_id = ?")
      .all(userId, id) as any[];

    return mapProjectRow(row, tasks);
  }

  static async createProject(userId: string, payload: Partial<Project>): Promise<Project> {
    const db = getDb();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO projects (
        id, user_id, title, description, status, priority, color,
        start_date, target_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      userId,
      payload.title,
      payload.description || null,
      payload.status || "active",
      payload.priority || "medium",
      payload.color || "#4F46E5",
      payload.start_date || null,
      payload.target_date || null,
      now,
      now
    );

    const created = await this.getProjectById(userId, id);
    if (!created) throw new Error("Failed to create project record.");
    return created;
  }

  static async updateProject(
    userId: string,
    id: string,
    payload: Partial<Project>
  ): Promise<Project> {
    const db = getDb();
    const existing = await this.getProjectById(userId, id);
    if (!existing) {
      throw new Error("Project not found or unauthorized access.");
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
    if (payload.status !== undefined) {
      fields.push("status = ?");
      values.push(payload.status);
    }
    if (payload.priority !== undefined) {
      fields.push("priority = ?");
      values.push(payload.priority);
    }
    if (payload.color !== undefined) {
      fields.push("color = ?");
      values.push(payload.color);
    }
    if (payload.start_date !== undefined) {
      fields.push("start_date = ?");
      values.push(payload.start_date);
    }
    if (payload.target_date !== undefined) {
      fields.push("target_date = ?");
      values.push(payload.target_date);
    }

    fields.push("updated_at = ?");
    values.push(new Date().toISOString());

    values.push(id, userId);

    db.prepare(`UPDATE projects SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`).run(...values);

    const updated = await this.getProjectById(userId, id);
    if (!updated) throw new Error("Failed to retrieve updated project.");
    return updated;
  }

  static async deleteProject(userId: string, id: string): Promise<void> {
    const db = getDb();
    const result = db.prepare("DELETE FROM projects WHERE id = ? AND user_id = ?").run(id, userId);
    if (result.changes === 0) {
      throw new Error("Project not found or unauthorized access.");
    }
  }
}
