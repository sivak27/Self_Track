import { apiClient } from "./apiClient";
import { Goal, CreateGoalInput } from "@/types/goal";

export const goalService = {
  async getGoals(): Promise<Goal[]> {
    return apiClient.get<Goal[]>("/goals");
  },

  async createGoal(data: CreateGoalInput): Promise<Goal> {
    return apiClient.post<Goal>("/goals", data);
  },

  async updateGoal(id: string, data: Partial<CreateGoalInput>): Promise<Goal> {
    return apiClient.patch<Goal>(`/goals/${id}`, data);
  },

  async incrementGoal(id: string, delta: number): Promise<Goal> {
    return apiClient.post<Goal>(`/goals/${id}/increment`, { delta });
  },

  async deleteGoal(id: string): Promise<void> {
    return apiClient.delete<void>(`/goals/${id}`);
  },
};
