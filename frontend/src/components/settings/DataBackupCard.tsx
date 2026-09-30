import React from "react";
import { Download, Database, ShieldCheck } from "lucide-react";

interface DataBackupCardProps {
  onExport: () => Promise<void>;
  isExporting: boolean;
}

export function DataBackupCard({ onExport, isExporting }: DataBackupCardProps) {
  return (
    <div className="rounded-2xl p-6 border border-slate-200 bg-white shadow-xs">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-5">
        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
          <Database className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Data Sovereignty & Backups</h3>
          <p className="text-xs text-slate-500">Download complete portable snapshot of your personal database</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-slate-900">Full JSON Archive</p>
            <p className="text-[11px] text-slate-500">
              Includes all expenses, income sources, budgets, tasks, projects, and goals.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onExport}
          disabled={isExporting}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-xs transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-indigo-600" />
          <span>{isExporting ? "Compiling Archive..." : "Export Full JSON Backup"}</span>
        </button>
      </div>
    </div>
  );
}
