import { apiClient } from "./apiClient";
import { AnalyticsMetrics } from "@/types/analytics";

export const analyticsService = {
  async getMetrics(): Promise<AnalyticsMetrics> {
    return apiClient.get<AnalyticsMetrics>("/analytics");
  },
  async getDashboardMetrics(): Promise<AnalyticsMetrics> {
    return apiClient.get<AnalyticsMetrics>("/analytics");
  },
};
