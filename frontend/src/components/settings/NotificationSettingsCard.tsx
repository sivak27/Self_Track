import React from "react";
import { Bell, ShieldAlert, MailCheck } from "lucide-react";

interface NotificationSettingsCardProps {
  emailNotifications: boolean;
  onEmailNotificationsChange: (val: boolean) => void;
  weeklySummary: boolean;
  onWeeklySummaryChange: (val: boolean) => void;
  budgetAlerts: boolean;
  onBudgetAlertsChange: (val: boolean) => void;
}

export function NotificationSettingsCard({
  emailNotifications,
  onEmailNotificationsChange,
  weeklySummary,
  onWeeklySummaryChange,
  budgetAlerts,
  onBudgetAlertsChange,
}: NotificationSettingsCardProps) {
  return (
    <div className="rounded-2xl p-6 border border-slate-200 bg-white shadow-xs">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-5">
        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Alerts & Notifications</h3>
          <p className="text-xs text-slate-500">Configure automated briefings and budget threshold warnings</p>
        </div>
      </div>

      <div className="space-y-4">
        <label className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={emailNotifications}
            onChange={(e) => onEmailNotificationsChange(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <div>
            <span className="text-sm font-semibold text-slate-900 block">Email Dispatch System</span>
            <span className="text-xs text-slate-500">
              Receive security alerts and account recovery instructions
            </span>
          </div>
        </label>

        <label className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={weeklySummary}
            onChange={(e) => onWeeklySummaryChange(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <div>
            <span className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <MailCheck className="w-4 h-4 text-emerald-600" />
              Weekly Executive Digest
            </span>
            <span className="text-xs text-slate-500">
              Receive a Monday morning briefing summarizing burn rate, savings, and open tasks
            </span>
          </div>
        </label>

        <label className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={budgetAlerts}
            onChange={(e) => onBudgetAlertsChange(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <div>
            <span className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Budget Threshold Alarms
            </span>
            <span className="text-xs text-slate-500">
              Trigger high-priority alerts when an expense envelope reaches 85% or higher
            </span>
          </div>
        </label>
      </div>
    </div>
  );
}
