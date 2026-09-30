import { useState, useEffect, useCallback } from "react";
import { Expense, ExpenseCategory, CreateExpenseInput, UpdateExpenseInput, ExpenseFilter } from "@/types/expense";
import { expenseService } from "@/services/expenseService";

export function useExpenses(initialFilters?: ExpenseFilter) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [filters, setFilters] = useState<ExpenseFilter>(initialFilters || {});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await expenseService.getCategories();
      setCategories(data);
    } catch (err: unknown) {
      console.error("Failed to load expense categories:", err);
    }
  }, []);

  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await expenseService.getExpenses(filters);
      setExpenses(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load expenses";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const addExpense = async (input: CreateExpenseInput) => {
    const created = await expenseService.createExpense(input);
    setExpenses((prev) => [created, ...prev]);
    return created;
  };

  const updateExpense = async (id: string, input: UpdateExpenseInput) => {
    const updated = await expenseService.updateExpense(id, input);
    setExpenses((prev) => prev.map((exp) => (exp.id === id ? updated : exp)));
    return updated;
  };

  const deleteExpense = async (id: string) => {
    await expenseService.deleteExpense(id);
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
  };

  const addCategory = async (name: string, color?: string, icon?: string) => {
    const created = await expenseService.createCategory({ name, color, icon });
    setCategories((prev) => [...prev, created]);
    return created;
  };

  // Aggregated calculations
  const totalAmount = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const recurringTotal = expenses
    .filter((item) => item.is_recurring)
    .reduce((sum, item) => sum + Number(item.amount), 0);

  return {
    expenses,
    categories,
    filters,
    setFilters,
    isLoading,
    error,
    refresh: fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    addCategory,
    totalAmount,
    recurringTotal,
  };
}
