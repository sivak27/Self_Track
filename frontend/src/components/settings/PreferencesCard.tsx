import React from "react";
import { Sliders, DollarSign, Calendar, Sun } from "lucide-react";

interface PreferencesCardProps {
  currency: string;
  onCurrencyChange: (val: string) => void;
  dateFormat: string;
  onDateFormatChange: (val: string) => void;
  theme: "dark" | "light" | "system";
  onThemeChange: (val: "dark" | "light" | "system") => void;
}

export function PreferencesCard({
  currency,
  onCurrencyChange,
  dateFormat,
  onDateFormatChange,
  theme,
  onThemeChange,
}: PreferencesCardProps) {
  return (
    <div className="rounded-2xl p-6 border border-slate-200 bg-white shadow-xs">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-5">
        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
          <Sliders className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">System Preferences</h3>
          <p className="text-xs text-slate-500">Localization, standard currency, and format rules</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Base Currency
          </label>
          <div className="relative">
            <DollarSign className="w-4 h-4 text-indigo-600 absolute left-3.5 top-3" />
            <select
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="w-full appearance-none pl-10 pr-8 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
            >
              <option value="USD">USD ($ - United States Dollar)</option>
              <option value="EUR">EUR (€ - Euro)</option>
              <option value="GBP">GBP (£ - British Pound)</option>
              <option value="CAD">CAD ($ - Canadian Dollar)</option>
              <option value="AUD">AUD ($ - Australian Dollar)</option>
              <option value="JPY">JPY (¥ - Japanese Yen)</option>
              <option value="INR">INR (₹ - Indian Rupee)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Date Format
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-indigo-600 absolute left-3.5 top-3" />
            <select
              value={dateFormat}
              onChange={(e) => onDateFormatChange(e.target.value)}
              className="w-full appearance-none pl-10 pr-8 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
            >
              <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY (UK/EU)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            UI Appearance
          </label>
          <div className="relative">
            <Sun className="w-4 h-4 text-indigo-600 absolute left-3.5 top-3" />
            <select
              value={theme}
              onChange={(e) => onThemeChange(e.target.value as "dark" | "light" | "system")}
              className="w-full appearance-none pl-10 pr-8 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
            >
              <option value="light">Clean Light Mode (Active Default)</option>
              <option value="system">System Default</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
