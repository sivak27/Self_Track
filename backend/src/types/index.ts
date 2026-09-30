export interface AuthUser {
  id: string;
  email?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  currency: string;
  date_format: string;
  theme: string;
  email_notifications: boolean;
  weekly_summary_enabled: boolean;
  budget_alert_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExpenseCategory {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  currency: string;
  description: string;
  date: string;
  payment_method: string;
  is_recurring: boolean;
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
  category?: ExpenseCategory;
}

export interface IncomeSource {
  id: string;
  user_id: string;
  name: string;
  type: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export type IncomeSourceCategory =
  | "salary"
  | "part_time"
  | "freelance"
  | "friends"
  | "investments"
  | "business"
  | "gift"
  | "other";

export type DepositStatus = "received" | "deposited" | "pending";

export interface Income {
  id: string;
  user_id: string;
  source_id: string | null;
  income_source: IncomeSourceCategory;
  deposit_status: DepositStatus;
  amount: number;
  currency: string;
  description: string;
  date: string;
  is_recurring: boolean;
  created_at: string;
  updated_at: string;
  source?: IncomeSource;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  period: "monthly" | "weekly" | "yearly" | "custom";
  start_date: string;
  end_date: string | null;
  alert_threshold: number;
  created_at: string;
  updated_at: string;
  category?: ExpenseCategory;
  spent?: number;
  percentage?: number;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: "planning" | "active" | "on_hold" | "completed" | "archived";
  priority: "low" | "medium" | "high" | "urgent";
  color: string;
  start_date: string | null;
  target_date: string | null;
  created_at: string;
  updated_at: string;
  total_tasks?: number;
  completed_tasks?: number;
  progress_pct?: number;
}

export interface Task {
  id: string;
  user_id: string;
  project_id: string | null;
  goal_id: string | null;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "review" | "completed";
  priority: "low" | "medium" | "high" | "urgent";
  due_date: string | null;
  estimated_minutes: number | null;
  actual_minutes: number | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  project?: Project;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: "financial_savings" | "financial_investment" | "productivity" | "career" | "personal";
  target_value: number;
  current_value: number;
  unit: string;
  target_date: string | null;
  status: "not_started" | "in_progress" | "achieved" | "paused";
  created_at: string;
  updated_at: string;
  progress_pct?: number;
}

export interface AnalyticsData {
  financial: {
    totalIncome: number;
    availableIncome: number;
    receivedIncome: number;
    depositedIncome: number;
    pendingIncome: number;
    totalExpenses: number;
    currentBalance: number;
    netSavings: number;
    savingsRate: number;
    budgetUtilization: number;
  };
  productivity: {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    activeProjects: number;
    achievedGoals: number;
  };
  cashflowTrend: Array<{
    month: string;
    income: number;
    expenses: number;
    savings: number;
  }>;
  expenseByCategory: Array<{
    category: string;
    amount: number;
    color: string;
    percentage: number;
  }>;
}
