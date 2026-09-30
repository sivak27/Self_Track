import { ExpenseCategory } from "./expense";

export type BudgetPeriod = "monthly" | "yearly";

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  period: BudgetPeriod;
  start_date: string;
  end_date: string;
  alert_threshold_pct: number;
  created_at: string;
  updated_at: string;
  category?: ExpenseCategory;
  // Computed tracking fields
  spent_amount?: number;
  remaining_amount?: number;
  percentage_used?: number;
  is_over_budget?: boolean;
}

export interface CreateBudgetInput {
  category_id: string;
  amount: number;
  period?: BudgetPeriod;
  start_date: string;
  end_date: string;
  alert_threshold_pct?: number;
}

export interface UpdateBudgetInput extends Partial<CreateBudgetInput> {}
