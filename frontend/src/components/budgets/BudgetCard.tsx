"use client";

import React from "react";
import { Edit2, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Budget } from "@/types/budget";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const spent = Number(budget.spent_amount || 0);
  const total = Number(budget.amount);
  const pct = budget.percentage_used || 0;
  const isOver = budget.is_over_budget;
  const isNearLimit = !isOver && pct >= budget.alert_threshold_pct;

  // Determine progress bar and border color
  let progressColor = "bg-indigo-600";
  let statusBadgeColor = "text-indigo-700 bg-indigo-50 border-indigo-200";
  let statusText = "On Track";

  if (isOver) {
    progressColor = "bg-rose-600";
    statusBadgeColor = "text-rose-700 bg-rose-50 border-rose-200";
    statusText = "Over Limit";
  } else if (isNearLimit) {
    progressColor = "bg-amber-600";
    statusBadgeColor = "text-amber-700 bg-amber-50 border-amber-200";
    statusText = "Near Threshold";
  }

  return (
    <div className="rounded-2xl p-5 border border-slate-200 bg-white shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {budget.category && (
              <span
                className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: budget.category.color }}
              />
            )}
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-snug">
                {budget.category?.name || "Uncategorized Budget"}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {formatDate(budget.start_date)} - {formatDate(budget.end_date)} • {budget.period}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(budget)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Edit Budget"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(budget.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete Budget"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Numbers */}
        <div className="mt-5 flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-bold font-mono text-slate-900">
              {formatCurrency(spent)}
            </span>
            <span className="text-xs text-slate-500 font-mono ml-1.5">
              / {formatCurrency(total)}
            </span>
          </div>

          <span
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusBadgeColor}`}
          >
            {isOver ? (
              <AlertTriangle className="w-3 h-3" />
            ) : isNearLimit ? (
              <AlertTriangle className="w-3 h-3" />
            ) : (
              <CheckCircle2 className="w-3 h-3" />
            )}
            {statusText} ({pct}%)
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 relative w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      </div>

      {/* Footer Details */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>
          Remaining:{" "}
          <strong
            className={`font-mono font-bold ${
              isOver ? "text-rose-600" : "text-emerald-600"
            }`}
          >
            {isOver ? `-${formatCurrency(spent - total)}` : formatCurrency(total - spent)}
          </strong>
        </span>
        <span className="text-[11px] text-slate-400">Alert at {budget.alert_threshold_pct}%</span>
      </div>
    </div>
  );
}
