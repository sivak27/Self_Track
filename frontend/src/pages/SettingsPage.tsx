import React, { useState, useEffect } from "react";
import { Check, Save, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { ProfileSettingsCard } from "@/components/settings/ProfileSettingsCard";
import { PreferencesCard } from "@/components/settings/PreferencesCard";
import { NotificationSettingsCard } from "@/components/settings/NotificationSettingsCard";
import { DataBackupCard } from "@/components/settings/DataBackupCard";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { useSettings } from "@/hooks/settings/useSettings";

export function SettingsPage() {
  const {
    profile,
    settings,
    isLoading,
    isSaving,
    isExporting,
    error,
    successMessage,
    saveSettings,
    downloadBackup,
  } = useSettings();

  const [fullName, setFullName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [dateFormat, setDateFormat] = useState("YYYY-MM-DD");
  const [theme, setTheme] = useState<"dark" | "light" | "system">("light");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);

  useEffect(() => {
    document.title = "Settings & Governance | Personal Control Center";
  }, []);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
    }
    if (settings) {
      setCurrency(settings.currency || "USD");
      setDateFormat(settings.date_format || "YYYY-MM-DD");
      setTheme(settings.theme || "light");
      setEmailNotifications(settings.email_notifications ?? true);
      setWeeklySummary(settings.weekly_summary_enabled ?? true);
      setBudgetAlerts(settings.budget_alert_notifications ?? true);
    }
  }, [profile, settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings({
      full_name: fullName,
      currency,
      date_format: dateFormat,
      theme,
      email_notifications: emailNotifications,
      weekly_summary_enabled: weeklySummary,
      budget_alert_notifications: budgetAlerts,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="System Settings"
          description="Loading personal configuration parameters..."
        />
        <LoadingSkeleton count={3} className="h-44 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSave} className="space-y-6">
        <PageHeader
          title="Settings & Governance"
          description="Manage security preferences, reporting currency, automated briefs, and database backups."
        >
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving Preferences..." : "Save Preferences"}</span>
          </button>
        </PageHeader>

        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <ProfileSettingsCard
          profile={profile}
          fullName={fullName}
          onFullNameChange={setFullName}
        />

        <PreferencesCard
          currency={currency}
          onCurrencyChange={setCurrency}
          dateFormat={dateFormat}
          onDateFormatChange={setDateFormat}
          theme={theme}
          onThemeChange={setTheme}
        />

        <NotificationSettingsCard
          emailNotifications={emailNotifications}
          onEmailNotificationsChange={setEmailNotifications}
          weeklySummary={weeklySummary}
          onWeeklySummaryChange={setWeeklySummary}
          budgetAlerts={budgetAlerts}
          onBudgetAlertsChange={setBudgetAlerts}
        />

        <DataBackupCard
          onExport={downloadBackup}
          isExporting={isExporting}
        />
      </form>
    </div>
  );
}
