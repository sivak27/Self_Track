export type GoalCategory =
  | "financial_savings"
  | "financial_investment"
  | "productivity"
  | "career"
  | "personal";

export type GoalStatus = "not_started" | "in_progress" | "achieved" | "paused";

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: GoalCategory;
  target_value: number;
  current_value: number;
  unit: string;
  target_date: string | null;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
  // Computed
  progress_pct?: number;
}

export interface CreateGoalInput {
  title: string;
  description?: string | null;
  category: GoalCategory;
  target_value: number;
  current_value?: number;
  unit?: string;
  target_date?: string | null;
  status?: GoalStatus;
}

export interface UpdateGoalInput extends Partial<CreateGoalInput> {}
