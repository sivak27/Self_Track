import { apiClient } from "./apiClient";
import { Profile, UserSettings, UpdateSettingsInput } from "@/types/settings";

export const settingsService = {
  async getSettings(): Promise<{ profile: Profile; settings: UserSettings }> {
    return apiClient.get<{ profile: Profile; settings: UserSettings }>("/settings");
  },

  async updateSettings(data: UpdateSettingsInput): Promise<{ profile: Profile; settings: UserSettings }> {
    return apiClient.patch<{ profile: Profile; settings: UserSettings }>("/settings", data);
  },

  async exportData(): Promise<Record<string, unknown>> {
    return apiClient.get<Record<string, unknown>>("/settings/export");
  },
};
