"use client";

import React from "react";
import { Search, Filter, ShieldCheck } from "lucide-react";
import {
  IncomeFilter,
  IncomeSourceCategory,
  DepositStatus,
  INCOME_SOURCE_OPTIONS,
  DEPOSIT_STATUS_OPTIONS,
} from "@/types/income";

interface IncomeFiltersProps {
  filters: IncomeFilter;
  onChange: (filters: IncomeFilter) => void;
}

export function IncomeFilters({ filters, onChange }: IncomeFiltersProps) {
  const hasActiveFilters = Boolean(
    filters.search ||
    filters.income_source ||
    filters.deposit_status ||
    filters.startDate ||
    filters.endDate
  );

  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200 mb-6 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search by description or client..."
          value={filters.search || ""}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Income Source Dropdown */}
        <div className="relative min-w-[170px]">
          <select
            value={filters.income_source || ""}
            onChange={(e) =>
              onChange({
                ...filters,
                income_source: (e.target.value as IncomeSourceCategory) || undefined,
              })
            }
            className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
          >
            <option value="">All Income Sources</option>
            {INCOME_SOURCE_OPTIONS.map((src) => (
              <option key={src.value} value={src.value}>
                {src.label}
              </option>
            ))}
          </select>
          <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
        </div>

        {/* Deposit Status Dropdown */}
        <div className="relative min-w-[160px]">
          <select
            value={filters.deposit_status || ""}
            onChange={(e) =>
              onChange({
                ...filters,
                deposit_status: (e.target.value as DepositStatus) || undefined,
              })
            }
            className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
          >
            <option value="">All Deposit Statuses</option>
            {DEPOSIT_STATUS_OPTIONS.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
        </div>

        {/* Dates */}
        <input
          type="date"
          value={filters.startDate || ""}
          onChange={(e) => onChange({ ...filters, startDate: e.target.value || undefined })}
          className="py-2 px-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
          title="From date"
        />

        <input
          type="date"
          value={filters.endDate || ""}
          onChange={(e) => onChange({ ...filters, endDate: e.target.value || undefined })}
          className="py-2 px-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
          title="To date"
        />

        {hasActiveFilters && (
          <button
            onClick={() => onChange({})}
            className="px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors"
          >
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
}
