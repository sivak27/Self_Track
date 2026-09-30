import { useState, useEffect, useCallback } from "react";
import { UserSettings, Profile, UpdateSettingsInput } from "@/types/settings";
import { settingsService } from "@/services/settingsService";

export function useSettings() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await settingsService.getSettings();
      setProfile(data.profile);
      setSettings(data.settings);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load preferences";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = async (input: UpdateSettingsInput & { full_name?: string }) => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const data = await settingsService.updateSettings(input);
      setProfile(data.profile);
      setSettings(data.settings);
      setSuccessMessage("Settings saved successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save settings";
      setError(msg);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const downloadBackup = async () => {
    setIsExporting(true);
    try {
      const data = await settingsService.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `control-center-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to download backup";
      setError(msg);
    } finally {
      setIsExporting(false);
    }
  };

  return {
    profile,
    settings,
    isLoading,
    isSaving,
    isExporting,
    error,
    successMessage,
    saveSettings,
    downloadBackup,
    refresh: fetchSettings,
  };
}
