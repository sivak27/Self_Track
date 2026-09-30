import { apiClient } from "./apiClient";
import { Income, IncomeSource, CreateIncomeInput, IncomeFilters } from "@/types/income";

export const incomeService = {
  async getIncome(filters?: IncomeFilters): Promise<Income[]> {
    return apiClient.get<Income[]>("/income", {
      params: {
        search: filters?.search,
        sourceId: filters?.sourceId,
        income_source: filters?.income_source,
        deposit_status: filters?.deposit_status,
        startDate: filters?.startDate,
        endDate: filters?.endDate,
      },
    });
  },

  async getIncomeById(id: string): Promise<Income> {
    return apiClient.get<Income>(`/income/${id}`);
  },

  async createIncome(data: CreateIncomeInput): Promise<Income> {
    return apiClient.post<Income>("/income", data);
  },

  async updateIncome(id: string, data: Partial<CreateIncomeInput>): Promise<Income> {
    return apiClient.patch<Income>(`/income/${id}`, data);
  },

  async deleteIncome(id: string): Promise<void> {
    return apiClient.delete<void>(`/income/${id}`);
  },

  async getSources(): Promise<IncomeSource[]> {
    return apiClient.get<IncomeSource[]>("/income/sources");
  },

  async createSource(data: { name: string; type?: string; color?: string }): Promise<IncomeSource> {
    return apiClient.post<IncomeSource>("/income/sources", {
      name: data.name,
      type: data.type || "other",
      color: data.color || "#10B981",
    });
  },
};
