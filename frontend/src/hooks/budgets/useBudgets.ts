import { useState, useEffect, useCallback } from "react";
import { Budget, CreateBudgetInput, UpdateBudgetInput } from "@/types/budget";
import { ExpenseCategory } from "@/types/expense";
import { budgetService } from "@/services/budgetService";
import { expenseService } from "@/services/expenseService";

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await expenseService.getCategories();
      setCategories(data);
    } catch (err: unknown) {
      console.error("Failed to load categories:", err);
    }
  }, []);

  const fetchBudgets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await budgetService.getBudgets();
      setBudgets(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load budgets";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchBudgets();
  }, [fetchCategories, fetchBudgets]);

  const addBudget = async (input: CreateBudgetInput) => {
    const created = await budgetService.createBudget(input);
    setBudgets((prev) => [created, ...prev]);
    return created;
  };

  const updateBudget = async (id: string, input: UpdateBudgetInput) => {
    const updated = await budgetService.updateBudget(id, input);
    setBudgets((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));
    return updated;
  };

  const deleteBudget = async (id: string) => {
    await budgetService.deleteBudget(id);
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  // Aggregated totals
  const totalAllocated = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + Number(b.spent_amount || 0), 0);
  const totalRemaining = Math.max(0, totalAllocated - totalSpent);
  const overBudgetCount = budgets.filter((b) => b.is_over_budget).length;

  return {
    budgets,
    categories,
    isLoading,
    error,
    refresh: fetchBudgets,
    addBudget,
    updateBudget,
    deleteBudget,
    totalAllocated,
    totalSpent,
    totalRemaining,
    overBudgetCount,
  };
}
