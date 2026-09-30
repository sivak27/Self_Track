"use client";

import React, { useState } from "react";
import { Edit2, Trash2, Repeat, TrendingUp, CheckCircle, Clock, Building2 } from "lucide-react";
import { Income, getSourceLabel, getSourceColor } from "@/types/income";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

interface IncomeListProps {
  incomes: Income[];
  isLoading: boolean;
  onEdit: (income: Income) => void;
  onDelete: (id: string) => Promise<void>;
  onAddNew: () => void;
}

export function IncomeList({
  incomes,
  isLoading,
  onEdit,
  onDelete,
  onAddNew,
}: IncomeListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      setIsDeleting(true);
      await onDelete(deletingId);
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <LoadingSkeleton count={5} className="h-16 w-full" />
      </div>
    );
  }

  if (incomes.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="No Income Records"
        description="No revenue entries recorded yet. Record your salary, dividends, part-time work, or freelance income."
        actionLabel="Record First Income"
        onAction={onAddNew}
      />
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Date</th>
                <th className="py-3.5 px-4">Description / Payer</th>
                <th className="py-3.5 px-4">Source</th>
                <th className="py-3.5 px-4">Deposit Status</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {incomes.map((item) => {
                const sourceLabel = item.source?.name || getSourceLabel(item.income_source);
                const sourceColor = item.source?.color || getSourceColor(item.income_source);

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/75 transition-colors group"
                  >
                    <td className="py-3.5 px-4 sm:px-6 text-slate-600 text-xs font-medium whitespace-nowrap">
                      {formatDate(item.date)}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{item.description}</span>
                        {item.is_recurring && (
                          <span
                            title="Recurring Stream"
                            className="p-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200"
                          >
                            <Repeat className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: `${sourceColor}15`,
                          color: sourceColor,
                          border: `1px solid ${sourceColor}30`,
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: sourceColor }}
                        />
                        {sourceLabel}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.deposit_status === "deposited" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                          <Building2 className="w-3.5 h-3.5 text-blue-600" />
                          Deposited
                        </span>
                      ) : item.deposit_status === "received" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          Received
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Pending / Expected
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold whitespace-nowrap">
                      <span
                        className={
                          item.deposit_status === "pending"
                            ? "text-amber-600"
                            : "text-emerald-600"
                        }
                      >
                        +{formatCurrency(Number(item.amount))}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Edit Income"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Income"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deletingId}
        title="Delete Income Record"
        message="Are you sure you want to delete this income entry? This will permanently remove the record from SQLite and update your balances."
        confirmLabel="Delete Record"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </>
  );
}
