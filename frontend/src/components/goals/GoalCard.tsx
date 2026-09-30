"use client";

import React from "react";
import { Edit2, Trash2, Calendar, Trophy, Plus, CheckCircle2 } from "lucide-react";
import { Goal } from "@/types/goal";
import { formatDate } from "@/lib/utils/date";

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onIncrement: (id: string, delta: number) => void;
}

const categoryLabels: Record<string, { label: string; color: string }> = {
  financial_savings: { label: "Savings Target", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  financial_investment: { label: "Investment", color: "text-indigo-700 bg-indigo-50 border-indigo-200" },
  productivity: { label: "Productivity", color: "text-blue-700 bg-blue-50 border-blue-200" },
  career: { label: "Career & Skills", color: "text-purple-700 bg-purple-50 border-purple-200" },
  personal: { label: "Personal & Health", color: "text-amber-700 bg-amber-50 border-amber-200" },
};

export function GoalCard({ goal, onEdit, onDelete, onIncrement }: GoalCardProps) {
  const current = Number(goal.current_value);
  const target = Number(goal.target_value);
  const pct = goal.progress_pct || 0;
  const isAchieved = goal.status === "achieved" || current >= target;

  const cat = categoryLabels[goal.category] || {
    label: goal.category,
    color: "text-indigo-700 bg-indigo-50 border-indigo-200",
  };

  // Quick increment step: 10% of target or at least 1
  const step = Math.max(1, Math.round(target * 0.1));

  return (
    <div
      className={`rounded-2xl p-5 border transition-all ${
        isAchieved
          ? "bg-emerald-50/40 border-emerald-300 shadow-xs"
          : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md shadow-xs"
      } flex flex-col justify-between group`}
    >
      <div>
        {/* Top Badges & Actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${cat.color}`}
            >
              {cat.label}
            </span>
            {isAchieved && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border bg-emerald-50 border-emerald-200 text-emerald-700 flex items-center gap-1">
                <Trophy className="w-3 h-3 text-emerald-600" />
                Achieved
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(goal)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Edit Goal"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(goal.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete Goal"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug mb-1">
          {goal.title}
        </h3>
        {goal.description && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
            {goal.description}
          </p>
        )}

        {/* Numbers */}
        <div className="mt-4 flex items-baseline justify-between">
          <div className="font-mono">
            <span className="text-2xl font-bold text-slate-900">
              {goal.unit}
              {current.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 ml-1">
              / {goal.unit}
              {target.toLocaleString()}
            </span>
          </div>

          <span
            className={`text-xs font-mono font-bold ${
              isAchieved ? "text-emerald-600" : "text-indigo-600"
            }`}
          >
            {pct}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-2.5 w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isAchieved
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                : "bg-gradient-to-r from-indigo-500 to-indigo-600"
            }`}
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
      </div>

      {/* Footer Details & Quick Action */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        {goal.target_date ? (
          <span className="flex items-center gap-1.5 text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            {formatDate(goal.target_date)}
          </span>
        ) : (
          <span className="text-slate-400">No deadline</span>
        )}

        {!isAchieved && (
          <button
            onClick={() => onIncrement(goal.id, step)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors"
            title={`Add +${goal.unit}${step} to progress`}
          >
            <Plus className="w-3 h-3" />
            +{goal.unit}
            {step}
          </button>
        )}
      </div>
    </div>
  );
}
