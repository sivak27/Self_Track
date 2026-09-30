export interface FinancialSummary {
  totalIncome: number;
  availableIncome?: number;
  receivedIncome?: number;
  depositedIncome?: number;
  pendingIncome?: number;
  totalExpenses: number;
  currentBalance?: number;
  netSavings: number;
  savings?: number;
  savingsRate: number; // percentage
  topExpenseCategory: { name: string; amount: number; percentage: number } | null;
  totalBudgetAmount?: number;
  budgetSpent?: number;
  budgetUtilization?: number;
}

export interface ProductivitySummary {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number; // percentage
  activeProjects: number;
  completedProjects: number;
  activeGoals: number;
  achievedGoals: number;
}

export interface MonthlyCashflowPoint {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

export interface CategoryExpensePoint {
  name: string;
  amount: number;
  color: string;
}

export interface ProductivityTrendPoint {
  day: string;
  completedTasks: number;
  createdTasks: number;
}

export interface RecentTransactionItem {
  id: string;
  description: string;
  amount: number;
  categoryName: string;
  categoryColor: string;
  date: string;
  type: "expense" | "income";
  depositStatus?: string;
  incomeSource?: string;
}

export interface DashboardMetrics {
  financial: FinancialSummary;
  productivity: ProductivitySummary;
  recentExpenses: Array<{
    id: string;
    description: string;
    amount: number;
    categoryName: string;
    categoryColor: string;
    date: string;
    type?: "expense";
  }>;
  recentIncome?: Array<{
    id: string;
    description: string;
    amount: number;
    categoryName: string;
    categoryColor: string;
    date: string;
    type?: "income";
    depositStatus?: string;
    incomeSource?: string;
  }>;
  recentTransactions?: RecentTransactionItem[];
  recentTasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    projectTitle?: string;
    due_date?: string | null;
  }>;
  cashflowTrend: MonthlyCashflowPoint[];
  expenseByCategory: CategoryExpensePoint[];
}

export type AnalyticsMetrics = DashboardMetrics;
