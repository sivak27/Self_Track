import { getDb } from "../database/connection.js";

function getLast6Months(): Array<{ key: string; label: string }> {
  const result = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("default", { month: "short" });
    result.push({ key, label });
  }
  return result;
}

function formatSourceLabel(src?: string): string {
  const map: Record<string, string> = {
    salary: "Primary Salary",
    part_time: "Part-time",
    freelance: "Freelance / Consulting",
    friends: "Friends",
    investments: "Investments & Dividends",
    business: "Business",
    gift: "Gift",
    other: "Other",
  };
  return (src && map[src]) || "Other";
}

function getSourceColor(src?: string): string {
  const map: Record<string, string> = {
    salary: "#16A34A",
    part_time: "#0D9488",
    freelance: "#4F46E5",
    friends: "#EA580C",
    investments: "#0284C7",
    business: "#9333EA",
    gift: "#EC4899",
    other: "#64748B",
  };
  return (src && map[src]) || "#64748B";
}

export class AnalyticsService {
  static async getAnalytics(userId: string) {
    const db = getDb();

    // Financial queries
    const expRow = db
      .prepare("SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE user_id = ?")
      .get(userId) as { total: number };

    const receivedRow = db
      .prepare("SELECT COALESCE(SUM(amount), 0) as total FROM income WHERE user_id = ? AND deposit_status = 'received'")
      .get(userId) as { total: number };

    const depositedRow = db
      .prepare("SELECT COALESCE(SUM(amount), 0) as total FROM income WHERE user_id = ? AND deposit_status = 'deposited'")
      .get(userId) as { total: number };

    const pendingRow = db
      .prepare("SELECT COALESCE(SUM(amount), 0) as total FROM income WHERE user_id = ? AND deposit_status = 'pending'")
      .get(userId) as { total: number };

    const totalExpenses = Number(expRow?.total) || 0;
    const receivedIncome = Number(receivedRow?.total) || 0;
    const depositedIncome = Number(depositedRow?.total) || 0;
    const pendingIncome = Number(pendingRow?.total) || 0;

    // Realized / Available Income = Received in hand + Deposited in bank
    const availableIncome = receivedIncome + depositedIncome;
    // Total including expected receivables
    const totalIncome = availableIncome + pendingIncome;

    // Available cash balance strictly does NOT include pending / expected income
    const currentBalance = availableIncome - totalExpenses;
    const netSavings = currentBalance;
    const savings = netSavings;
    const savingsRate =
      availableIncome > 0 ? Math.round((Math.max(0, netSavings) / availableIncome) * 100) : 0;

    // Real Budget Utilization Calculation
    const userBudgets = db
      .prepare("SELECT id, category_id, amount FROM budgets WHERE user_id = ?")
      .all(userId) as { id: string; category_id: string; amount: number }[];
    const totalBudgetAmount = userBudgets.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
    let budgetSpent = 0;
    if (userBudgets.length > 0) {
      const budgetCategoryIds = userBudgets.map((b) => b.category_id);
      const placeholders = budgetCategoryIds.map(() => "?").join(",");
      const spentRow = db
        .prepare(`
          SELECT COALESCE(SUM(amount), 0) as total_spent
          FROM expenses
          WHERE user_id = ? AND category_id IN (${placeholders})
        `)
        .get(userId, ...budgetCategoryIds) as { total_spent: number };
      budgetSpent = Number(spentRow?.total_spent) || 0;
    }
    const budgetUtilization = totalBudgetAmount > 0 ? Math.round((budgetSpent / totalBudgetAmount) * 100) : 0;

    // Expenses by Category breakdown
    const categoryBreakdown = db
      .prepare(`
        SELECT 
          COALESCE(c.name, 'Other') as category,
          COALESCE(c.color, '#64748B') as color,
          SUM(e.amount) as amount
        FROM expenses e
        LEFT JOIN expense_categories c ON e.category_id = c.id
        WHERE e.user_id = ?
        GROUP BY c.id, c.name, c.color
        HAVING amount > 0
        ORDER BY amount DESC
      `)
      .all(userId) as { category: string; color: string; amount: number }[];

    const expenseByCategory = categoryBreakdown.map((c) => ({
      name: c.category,
      category: c.category,
      amount: Number(c.amount) || 0,
      color: c.color,
      percentage: totalExpenses > 0 ? Math.round((Number(c.amount) / totalExpenses) * 100) : 0,
    }));

    const topExpenseCategory =
      expenseByCategory.length > 0
        ? {
            name: expenseByCategory[0].name,
            amount: expenseByCategory[0].amount,
            percentage: expenseByCategory[0].percentage,
          }
        : null;

    // Productivity queries
    const taskCountRow = db
      .prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
        FROM tasks 
        WHERE user_id = ?
      `)
      .get(userId) as { total: number; completed: number };

    const totalTasks = Number(taskCountRow?.total) || 0;
    const completedTasks = Number(taskCountRow?.completed) || 0;
    const pendingTasks = Math.max(0, totalTasks - completedTasks);
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const projCounts = db
      .prepare(`
        SELECT 
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count
        FROM projects 
        WHERE user_id = ?
      `)
      .get(userId) as { active_count: number; completed_count: number };

    const activeProjects = Number(projCounts?.active_count) || 0;
    const completedProjects = Number(projCounts?.completed_count) || 0;

    const goalCounts = db
      .prepare(`
        SELECT 
          SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as active_count,
          SUM(CASE WHEN status = 'achieved' THEN 1 ELSE 0 END) as achieved_count
        FROM goals 
        WHERE user_id = ?
      `)
      .get(userId) as { active_count: number; achieved_count: number };

    const activeGoals = Number(goalCounts?.active_count) || 0;
    const achievedGoals = Number(goalCounts?.achieved_count) || 0;

    // 6-Month cashflow trend
    const months = getLast6Months();
    const incomeRows = db
      .prepare("SELECT amount, date, deposit_status FROM income WHERE user_id = ?")
      .all(userId) as { amount: number; date: string; deposit_status: string }[];
    const expenseRows = db
      .prepare("SELECT amount, date FROM expenses WHERE user_id = ?")
      .all(userId) as { amount: number; date: string }[];

    const cashflowTrend = months.map((m) => {
      // Only realized income (received or deposited) counts towards actual cashflow trend
      const monthIncome = incomeRows
        .filter((i) => i.date.startsWith(m.key) && i.deposit_status !== "pending")
        .reduce((acc, i) => acc + (Number(i.amount) || 0), 0);

      const monthExpenses = expenseRows
        .filter((e) => e.date.startsWith(m.key))
        .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

      return {
        month: m.label,
        income: monthIncome,
        expenses: monthExpenses,
        savings: monthIncome - monthExpenses,
      };
    });

    // Recent 5 expenses
    const rawExpenses = db
      .prepare(`
        SELECT e.id, e.description, e.amount, e.date, c.name as category_name, c.color as category_color
        FROM expenses e
        LEFT JOIN expense_categories c ON e.category_id = c.id
        WHERE e.user_id = ?
        ORDER BY e.date DESC, e.created_at DESC
        LIMIT 5
      `)
      .all(userId) as any[];

    const recentExpenses = rawExpenses.map((r) => ({
      id: r.id,
      description: r.description,
      amount: Number(r.amount),
      categoryName: r.category_name || "Uncategorized",
      categoryColor: r.category_color || "#64748B",
      date: r.date,
      type: "expense" as const,
      depositStatus: undefined as string | undefined,
    }));

    // Recent 5 income records
    const rawIncome = db
      .prepare(`
        SELECT i.id, i.description, i.amount, i.date, i.income_source, i.deposit_status, s.name as source_name, s.color as source_color
        FROM income i
        LEFT JOIN income_sources s ON i.source_id = s.id
        WHERE i.user_id = ?
        ORDER BY i.date DESC, i.created_at DESC
        LIMIT 5
      `)
      .all(userId) as any[];

    const recentIncome = rawIncome.map((r) => ({
      id: r.id,
      description: r.description,
      amount: Number(r.amount),
      categoryName: r.source_name || formatSourceLabel(r.income_source),
      categoryColor: r.source_color || getSourceColor(r.income_source),
      date: r.date,
      type: "income" as const,
      incomeSource: r.income_source || "other",
      depositStatus: r.deposit_status || "received",
    }));

    // Combined recent transactions sorted chronologically
    const allTransactions = [...recentExpenses, ...recentIncome].sort((a, b) => {
      if (b.date === a.date) return 0;
      return b.date > a.date ? 1 : -1;
    });
    const recentTransactions = allTransactions.slice(0, 5);

    // Upcoming tasks
    const rawTasks = db
      .prepare(`
        SELECT t.id, t.title, t.status, t.priority, t.due_date, p.title as project_title
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        WHERE t.user_id = ? AND t.status != 'completed'
        ORDER BY CASE WHEN t.due_date IS NULL THEN 1 ELSE 0 END, t.due_date ASC
        LIMIT 5
      `)
      .all(userId) as any[];

    const recentTasks = rawTasks.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      projectTitle: t.project_title || undefined,
      due_date: t.due_date || null,
    }));

    return {
      financial: {
        totalIncome,
        availableIncome,
        receivedIncome,
        depositedIncome,
        pendingIncome,
        totalExpenses,
        currentBalance,
        netSavings,
        savings,
        savingsRate,
        topExpenseCategory,
        totalBudgetAmount,
        budgetSpent,
        budgetUtilization,
      },
      productivity: {
        totalTasks,
        completedTasks,
        pendingTasks,
        completionRate,
        activeProjects,
        completedProjects,
        activeGoals,
        achievedGoals,
      },
      cashflowTrend,
      expenseByCategory,
      recentExpenses,
      recentIncome,
      recentTransactions,
      recentTasks,
    };
  }

  static async getExpenseAnalytics(userId: string) {
    const db = getDb();
    const categories = db
      .prepare(`
        SELECT 
          COALESCE(c.name, 'Uncategorized') as category,
          COALESCE(c.color, '#4F46E5') as color,
          SUM(e.amount) as total,
          COUNT(e.id) as count
        FROM expenses e
        LEFT JOIN expense_categories c ON e.category_id = c.id
        WHERE e.user_id = ?
        GROUP BY c.id, c.name, c.color
        ORDER BY total DESC
      `)
      .all(userId);

    const total = db
      .prepare("SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE user_id = ?")
      .get(userId) as { total: number };

    return {
      total: Number(total?.total) || 0,
      byCategory: categories,
    };
  }

  static async getIncomeAnalytics(userId: string) {
    const db = getDb();
    const sources = db
      .prepare(`
        SELECT 
          COALESCE(s.name, i.income_source) as source,
          COALESCE(s.color, '#16A34A') as color,
          SUM(i.amount) as total,
          COUNT(i.id) as count
        FROM income i
        LEFT JOIN income_sources s ON i.source_id = s.id
        WHERE i.user_id = ?
        GROUP BY i.income_source, s.id, s.name, s.color
        ORDER BY total DESC
      `)
      .all(userId);

    const receivedRow = db
      .prepare("SELECT COALESCE(SUM(amount), 0) as total FROM income WHERE user_id = ? AND deposit_status = 'received'")
      .get(userId) as { total: number };
    const depositedRow = db
      .prepare("SELECT COALESCE(SUM(amount), 0) as total FROM income WHERE user_id = ? AND deposit_status = 'deposited'")
      .get(userId) as { total: number };
    const pendingRow = db
      .prepare("SELECT COALESCE(SUM(amount), 0) as total FROM income WHERE user_id = ? AND deposit_status = 'pending'")
      .get(userId) as { total: number };

    const received = Number(receivedRow?.total) || 0;
    const deposited = Number(depositedRow?.total) || 0;
    const pending = Number(pendingRow?.total) || 0;
    const available = received + deposited;
    const total = available + pending;

    return {
      total,
      available,
      received,
      deposited,
      pending,
      bySource: sources,
    };
  }

  static async getDashboardMetrics(userId: string) {
    return this.getAnalytics(userId);
  }
}
