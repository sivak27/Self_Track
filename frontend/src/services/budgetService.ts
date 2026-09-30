import { apiClient } from "./apiClient";
import { Budget, CreateBudgetInput } from "@/types/budget";

export const budgetService = {
  async getBudgets(): Promise<Budget[]> {
    return apiClient.get<Budget[]>("/budgets");
  },

  async createBudget(data: CreateBudgetInput): Promise<Budget> {
    return apiClient.post<Budget>("/budgets", data);
  },

  async updateBudget(id: string, data: Partial<CreateBudgetInput>): Promise<Budget> {
    return apiClient.patch<Budget>(`/budgets/${id}`, data);
  },

  async deleteBudget(id: string): Promise<void> {
    return apiClient.delete<void>(`/budgets/${id}`);
  },
};
