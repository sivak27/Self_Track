import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "../config/env.js";

let dbInstance: Database.Database | null = null;

function resolveDatabasePath(): string {
  if (path.isAbsolute(env.DATABASE_PATH)) {
    return env.DATABASE_PATH;
  }

  // Check if relative path from current working directory exists or should be created
  const cwdResolved = path.resolve(process.cwd(), env.DATABASE_PATH);
  
  // Also check workspace root database location
  const fallbackPath = path.resolve(process.cwd(), "../database/personal-control-center.db");
  const localPath = path.resolve(process.cwd(), "database/personal-control-center.db");

  if (fs.existsSync(cwdResolved)) return cwdResolved;
  if (fs.existsSync(fallbackPath)) return fallbackPath;
  if (fs.existsSync(localPath)) return localPath;

  // If in backend folder, default to ../database/personal-control-center.db
  if (process.cwd().endsWith("backend")) {
    return fallbackPath;
  }
  return localPath;
}

export function getDb(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = resolveDatabasePath();
  const dbDir = path.dirname(dbPath);

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  console.log(`💽 Connecting to SQLite database at: ${dbPath}`);
  const db = new Database(dbPath);

  // Enable WAL mode and foreign keys for high performance and integrity
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("synchronous = NORMAL");

  initializeSchema(db);

  dbInstance = db;
  return dbInstance;
}

function initializeSchema(db: Database.Database): void {
  // Execute database initialization inside a transaction
  const initSql = `
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      email TEXT,
      full_name TEXT,
      avatar_url TEXT,
      currency TEXT NOT NULL DEFAULT 'USD',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS expense_categories (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#4F46E5',
      icon TEXT NOT NULL DEFAULT 'Tag',
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, name COLLATE NOCASE)
    );
    CREATE INDEX IF NOT EXISTS idx_expense_categories_user ON expense_categories(user_id);

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category_id TEXT REFERENCES expense_categories(id) ON DELETE SET NULL,
      amount REAL NOT NULL CHECK (amount > 0),
      currency TEXT NOT NULL DEFAULT 'USD',
      description TEXT NOT NULL,
      date TEXT NOT NULL DEFAULT (date('now')),
      payment_method TEXT DEFAULT 'credit_card',
      is_recurring INTEGER NOT NULL DEFAULT 0,
      receipt_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses(user_id);
    CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(user_id, date DESC);
    CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);

    CREATE TABLE IF NOT EXISTS income_sources (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'salary',
      color TEXT NOT NULL DEFAULT '#16A34A',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, name COLLATE NOCASE)
    );
    CREATE INDEX IF NOT EXISTS idx_income_sources_user ON income_sources(user_id);

    CREATE TABLE IF NOT EXISTS income (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      source_id TEXT REFERENCES income_sources(id) ON DELETE SET NULL,
      income_source TEXT NOT NULL DEFAULT 'other' CHECK (income_source IN ('salary', 'part_time', 'freelance', 'friends', 'investments', 'business', 'gift', 'other')),
      deposit_status TEXT NOT NULL DEFAULT 'received' CHECK (deposit_status IN ('received', 'deposited', 'pending')),
      amount REAL NOT NULL CHECK (amount > 0),
      currency TEXT NOT NULL DEFAULT 'USD',
      description TEXT NOT NULL,
      date TEXT NOT NULL DEFAULT (date('now')),
      is_recurring INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_income_user ON income(user_id);
    CREATE INDEX IF NOT EXISTS idx_income_date ON income(user_id, date DESC);
    CREATE INDEX IF NOT EXISTS idx_income_source ON income(source_id);

    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category_id TEXT NOT NULL REFERENCES expense_categories(id) ON DELETE CASCADE,
      amount REAL NOT NULL CHECK (amount > 0),
      period TEXT NOT NULL DEFAULT 'monthly' CHECK (period IN ('monthly', 'weekly', 'yearly', 'custom')),
      start_date TEXT NOT NULL,
      end_date TEXT,
      alert_threshold INTEGER NOT NULL DEFAULT 80 CHECK (alert_threshold BETWEEN 1 AND 100),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_budgets_user ON budgets(user_id);
    CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category_id);
    CREATE INDEX IF NOT EXISTS idx_budgets_user_period ON budgets(user_id, period, start_date);

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'archived')),
      priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
      color TEXT NOT NULL DEFAULT '#4F46E5',
      start_date TEXT,
      target_date TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);
    CREATE INDEX IF NOT EXISTS idx_projects_user_status ON projects(user_id, status);

    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL DEFAULT 'personal' CHECK (category IN ('financial_savings', 'financial_investment', 'productivity', 'career', 'personal')),
      target_value REAL NOT NULL CHECK (target_value > 0),
      current_value REAL NOT NULL DEFAULT 0,
      unit TEXT NOT NULL DEFAULT '$',
      target_date TEXT,
      status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'achieved', 'paused')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);
    CREATE INDEX IF NOT EXISTS idx_goals_user_status ON goals(user_id, status);

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
      goal_id TEXT REFERENCES goals(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'completed')),
      priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
      due_date TEXT,
      estimated_minutes INTEGER,
      actual_minutes INTEGER,
      completed_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(user_id, status);
    CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(user_id, due_date);
    CREATE INDEX IF NOT EXISTS idx_tasks_user_priority ON tasks(user_id, priority);

    CREATE TABLE IF NOT EXISTS user_settings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      currency TEXT NOT NULL DEFAULT 'USD',
      date_format TEXT NOT NULL DEFAULT 'YYYY-MM-DD',
      theme TEXT NOT NULL DEFAULT 'light',
      email_notifications INTEGER NOT NULL DEFAULT 1,
      weekly_summary_enabled INTEGER NOT NULL DEFAULT 1,
      budget_alert_notifications INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `;

  db.exec(initSql);

  // Safe migration for existing income table
  try {
    const tableInfo = db.prepare("PRAGMA table_info(income)").all() as Array<{ name: string }>;
    const colNames = new Set(tableInfo.map((c) => c.name));

    if (!colNames.has("income_source")) {
      db.exec(`
        ALTER TABLE income ADD COLUMN income_source TEXT NOT NULL DEFAULT 'other'
        CHECK (income_source IN ('salary', 'part_time', 'freelance', 'friends', 'investments', 'business', 'gift', 'other'));
      `);
    }

    if (!colNames.has("deposit_status")) {
      db.exec(`
        ALTER TABLE income ADD COLUMN deposit_status TEXT NOT NULL DEFAULT 'received'
        CHECK (deposit_status IN ('received', 'deposited', 'pending'));
      `);
    }

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_income_source_cat ON income(user_id, income_source);
      CREATE INDEX IF NOT EXISTS idx_income_deposit_status ON income(user_id, deposit_status);
    `);

    // Intelligent migration of existing income records:
    // If description mentions 'poorni', it is a friend gift/support -> 'friends' and 'received'
    db.exec(`
      UPDATE income 
      SET income_source = 'friends', deposit_status = 'received' 
      WHERE (description LIKE '%poorni%' OR description LIKE '%friend%') AND (income_source = 'other' OR income_source IS NULL);
    `);

    // Ensure all registered users have the complete 8 standard income sources
    const users = db.prepare("SELECT id FROM users").all() as Array<{ id: string }>;
    const standardSources = [
      { name: "Primary Salary", type: "salary", color: "#16A34A" },
      { name: "Part-time", type: "part_time", color: "#0D9488" },
      { name: "Freelance / Consulting", type: "freelance", color: "#4F46E5" },
      { name: "Friends", type: "friends", color: "#EA580C" },
      { name: "Investments & Dividends", type: "investments", color: "#0284C7" },
      { name: "Business", type: "business", color: "#9333EA" },
      { name: "Gift", type: "gift", color: "#EC4899" },
      { name: "Other", type: "other", color: "#64748B" },
    ];

    const checkSrc = db.prepare("SELECT id FROM income_sources WHERE user_id = ? AND name = ? COLLATE NOCASE");
    const insertSrc = db.prepare(
      "INSERT INTO income_sources (id, user_id, name, type, color, created_at, updated_at) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))"
    );

    for (const u of users) {
      for (const s of standardSources) {
        const existing = checkSrc.get(u.id, s.name);
        if (!existing) {
          insertSrc.run(crypto.randomUUID(), u.id, s.name, s.type, s.color);
        }
      }
    }
  } catch (migErr) {
    console.warn("Notice during income schema migration:", migErr);
  }

  console.log("✅ SQLite schema, migrations, and indexes verified successfully.");
}

export function closeDb(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
