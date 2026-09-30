import { useState, useEffect, useCallback } from "react";
import { Goal, CreateGoalInput, UpdateGoalInput } from "@/types/goal";
import { goalService } from "@/services/goalService";

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await goalService.getGoals();
      setGoals(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load goals";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const addGoal = async (input: CreateGoalInput) => {
    const created = await goalService.createGoal(input);
    setGoals((prev) => [created, ...prev]);
    return created;
  };

  const updateGoal = async (id: string, input: UpdateGoalInput) => {
    const updated = await goalService.updateGoal(id, input);
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updated } : g)));
    return updated;
  };

  const incrementGoalProgress = async (id: string, delta: number) => {
    const targetGoal = goals.find((g) => g.id === id);
    if (!targetGoal) return;
    const newCurrent = Math.max(0, Number(targetGoal.current_value) + delta);
    return await updateGoal(id, { current_value: newCurrent });
  };

  const deleteGoal = async (id: string) => {
    await goalService.deleteGoal(id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  // Metrics
  const totalCount = goals.length;
  const achievedCount = goals.filter((g) => g.status === "achieved").length;
  const inProgressCount = goals.filter((g) => g.status === "in_progress").length;
  const financialSavingsTotal = goals
    .filter((g) => g.category === "financial_savings")
    .reduce((sum, g) => sum + Number(g.current_value), 0);

  return {
    goals,
    isLoading,
    error,
    refresh: fetchGoals,
    addGoal,
    updateGoal,
    incrementGoalProgress,
    deleteGoal,
    totalCount,
    achievedCount,
    inProgressCount,
    financialSavingsTotal,
  };
}
