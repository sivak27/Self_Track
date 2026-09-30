import { apiClient } from "./apiClient";
import { Expense, ExpenseCategory, CreateExpenseInput, ExpenseFilters } from "@/types/expense";

export const expenseService = {
  async getExpenses(filters?: ExpenseFilters): Promise<Expense[]> {
    return apiClient.get<Expense[]>("/expenses", {
      params: {
        search: filters?.search,
        categoryId: filters?.categoryId,
        startDate: filters?.startDate,
        endDate: filters?.endDate,
        paymentMethod: filters?.paymentMethod,
      },
    });
  },

  async getExpenseById(id: string): Promise<Expense> {
    return apiClient.get<Expense>(`/expenses/${id}`);
  },

  async createExpense(data: CreateExpenseInput): Promise<Expense> {
    return apiClient.post<Expense>("/expenses", data);
  },

  async updateExpense(id: string, data: Partial<CreateExpenseInput>): Promise<Expense> {
    return apiClient.patch<Expense>(`/expenses/${id}`, data);
  },

  async deleteExpense(id: string): Promise<void> {
    return apiClient.delete<void>(`/expenses/${id}`);
  },

  async getCategories(): Promise<ExpenseCategory[]> {
    return apiClient.get<ExpenseCategory[]>("/expenses/categories");
  },

  async createCategory(data: { name: string; color?: string; icon?: string }): Promise<ExpenseCategory> {
    return apiClient.post<ExpenseCategory>("/expenses/categories", {
      name: data.name,
      color: data.color || "#4F46E5",
      icon: data.icon || "tag",
    });
  },
};
