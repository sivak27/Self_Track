import { useState, useEffect, useCallback } from "react";
import { Income, IncomeSource, CreateIncomeInput, UpdateIncomeInput, IncomeFilter } from "@/types/income";
import { incomeService } from "@/services/incomeService";

export function useIncome(initialFilters?: IncomeFilter) {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [sources, setSources] = useState<IncomeSource[]>([]);
  const [filters, setFilters] = useState<IncomeFilter>(initialFilters || {});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSources = useCallback(async () => {
    try {
      const data = await incomeService.getSources();
      setSources(data);
    } catch (err: unknown) {
      console.error("Failed to load income sources:", err);
    }
  }, []);

  const fetchIncome = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await incomeService.getIncome(filters);
      setIncomes(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load income records";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  useEffect(() => {
    fetchIncome();
  }, [fetchIncome]);

  const addIncome = async (input: CreateIncomeInput) => {
    const created = await incomeService.createIncome(input);
    setIncomes((prev) => [created, ...prev]);
    return created;
  };

  const updateIncome = async (id: string, input: UpdateIncomeInput) => {
    const updated = await incomeService.updateIncome(id, input);
    setIncomes((prev) => prev.map((inc) => (inc.id === id ? updated : inc)));
    return updated;
  };

  const deleteIncome = async (id: string) => {
    await incomeService.deleteIncome(id);
    setIncomes((prev) => prev.filter((inc) => inc.id !== id));
  };

  const addSource = async (name: string, type?: string, color?: string) => {
    const created = await incomeService.createSource({ name, type, color });
    setSources((prev) => [...prev, created]);
    return created;
  };

  // Aggregated calculations based on deposit_status
  const totalReceived = incomes
    .filter((i) => i.deposit_status === "received")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const totalDeposited = incomes
    .filter((i) => i.deposit_status === "deposited")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const totalPending = incomes
    .filter((i) => i.deposit_status === "pending")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const totalRealized = totalReceived + totalDeposited;

  const recurringIncome = incomes
    .filter((i) => i.is_recurring)
    .reduce((sum, item) => sum + Number(item.amount), 0);

  return {
    incomes,
    sources,
    filters,
    setFilters,
    isLoading,
    error,
    refresh: fetchIncome,
    addIncome,
    updateIncome,
    deleteIncome,
    addSource,
    totalReceived,
    totalDeposited,
    totalPending,
    totalRealized,
    recurringIncome,
  };
}
