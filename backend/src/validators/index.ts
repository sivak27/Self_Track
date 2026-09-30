import { z } from "zod";

// Auth validation
export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  newPassword: z.string().min(6, "New password must be at least 6 characters").optional(),
});

// Expense validation
export const createExpenseSchema = z.object({
  category_id: z.string().uuid("Invalid category ID").nullable().optional(),
  amount: z.number().positive("Amount must be greater than 0"),
  currency: z.string().min(1, "Currency is required").default("USD"),
  description: z.string().min(1, "Description is required").max(255),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  payment_method: z.string().default("credit_card"),
  is_recurring: z.boolean().default(false),
  receipt_url: z.string().url().nullable().optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const createExpenseCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color"),
  icon: z.string().min(1, "Icon identifier is required"),
});

// Income validation
export const incomeSourceCategoryEnum = z.enum([
  "salary",
  "part_time",
  "freelance",
  "friends",
  "investments",
  "business",
  "gift",
  "other",
], {
  errorMap: () => ({ message: "Income source must be one of: salary, part_time, freelance, friends, investments, business, gift, other" }),
});

export const depositStatusEnum = z.enum(["received", "deposited", "pending"], {
  errorMap: () => ({ message: "Deposit status must be one of: received, deposited, pending" }),
});

export const createIncomeSchema = z.object({
  source_id: z.string().uuid("Invalid source ID").nullable().optional(),
  income_source: incomeSourceCategoryEnum,
  deposit_status: depositStatusEnum,
  amount: z.number().positive("Amount must be greater than 0"),
  currency: z.string().min(1, "Currency is required").default("USD"),
  description: z.string().min(1, "Description is required").max(255),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  is_recurring: z.boolean().default(false),
});

export const updateIncomeSchema = createIncomeSchema.partial();

export const createIncomeSourceSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  type: z.enum(["salary", "part_time", "freelance", "friends", "investments", "business", "gift", "other"]).default("salary"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color"),
});

// Budget validation
export const createBudgetSchema = z.object({
  category_id: z.string().uuid("Invalid category ID"),
  amount: z.number().positive("Budget amount must be greater than 0"),
  period: z.enum(["monthly", "weekly", "yearly", "custom"]).default("monthly"),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").nullable().optional(),
  alert_threshold: z.number().min(1).max(100).default(80),
});

export const updateBudgetSchema = createBudgetSchema.partial();

// Task validation
export const createTaskSchema = z.object({
  project_id: z.string().uuid().nullable().optional(),
  goal_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1, "Task title is required").max(200),
  description: z.string().max(1000).nullable().optional(),
  status: z.enum(["todo", "in_progress", "review", "completed"]).default("todo"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").nullable().optional(),
  estimated_minutes: z.number().int().positive().nullable().optional(),
  actual_minutes: z.number().int().positive().nullable().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

// Project validation
export const createProjectSchema = z.object({
  title: z.string().min(1, "Project title is required").max(150),
  description: z.string().max(1000).nullable().optional(),
  status: z.enum(["planning", "active", "on_hold", "completed", "archived"]).default("active"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color"),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").nullable().optional(),
  target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").nullable().optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

// Goal validation
export const createGoalSchema = z.object({
  title: z.string().min(1, "Goal title is required").max(150),
  description: z.string().max(1000).nullable().optional(),
  category: z.enum(["financial_savings", "financial_investment", "productivity", "career", "personal"]).default("personal"),
  target_value: z.number().positive("Target value must be greater than 0"),
  current_value: z.number().min(0).default(0),
  unit: z.string().min(1).default("$"),
  target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").nullable().optional(),
  status: z.enum(["not_started", "in_progress", "achieved", "paused"]).default("in_progress"),
});

export const updateGoalSchema = createGoalSchema.partial();

// Settings validation
export const updateSettingsSchema = z.object({
  full_name: z.string().max(100).optional(),
  currency: z.string().min(1).max(10).optional(),
  date_format: z.string().min(1).max(20).optional(),
  theme: z.enum(["dark", "light", "system"]).optional(),
  email_notifications: z.boolean().optional(),
  weekly_summary_enabled: z.boolean().optional(),
  budget_alert_notifications: z.boolean().optional(),
});
