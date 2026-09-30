import React from "react";
import { Search, Filter } from "lucide-react";
import { ExpenseCategory, ExpenseFilter } from "@/types/expense";

interface ExpenseFiltersProps {
  filters: ExpenseFilter;
  categories: ExpenseCategory[];
  onChange: (filters: ExpenseFilter) => void;
}

export function ExpenseFilters({ filters, categories, onChange }: ExpenseFiltersProps) {
  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200 mb-6 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search by description..."
          value={filters.search || ""}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Category Dropdown */}
        <div className="relative min-w-[160px] flex-1 sm:flex-initial">
          <select
            value={filters.categoryId || ""}
            onChange={(e) => onChange({ ...filters, categoryId: e.target.value || undefined })}
            className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
        </div>

        {/* Start Date */}
        <input
          type="date"
          value={filters.startDate || ""}
          onChange={(e) => onChange({ ...filters, startDate: e.target.value || undefined })}
          className="py-2 px-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
        />

        {/* End Date */}
        <input
          type="date"
          value={filters.endDate || ""}
          onChange={(e) => onChange({ ...filters, endDate: e.target.value || undefined })}
          className="py-2 px-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
        />

        {(filters.search || filters.categoryId || filters.startDate || filters.endDate) && (
          <button
            onClick={() => onChange({})}
            className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
