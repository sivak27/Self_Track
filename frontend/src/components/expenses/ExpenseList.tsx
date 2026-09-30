"use client";

import React, { useState } from "react";
import { Edit2, Trash2, Repeat, Receipt, CreditCard } from "lucide-react";
import { Expense } from "@/types/expense";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

interface ExpenseListProps {
  expenses: Expense[];
  isLoading: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => Promise<void>;
  onAddNew: () => void;
}

export function ExpenseList({
  expenses,
  isLoading,
  onEdit,
  onDelete,
  onAddNew,
}: ExpenseListProps) {
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

  if (expenses.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No Expenses Found"
        description="No expense records match your current criteria. Add an expense to start tracking."
        actionLabel="Record First Expense"
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
                <th className="py-3.5 px-4 sm:px-6">Description</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((expense) => (
                <tr
                  key={expense.id}
                  className="hover:bg-slate-50/75 transition-colors group"
                >
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{expense.description}</span>
                      {expense.is_recurring && (
                        <span
                          title="Recurring Monthly"
                          className="p-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200"
                        >
                          <Repeat className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {expense.category ? (
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${expense.category.color}15`,
                          color: expense.category.color,
                          border: `1px solid ${expense.category.color}30`,
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: expense.category.color }}
                        />
                        {expense.category.name}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Uncategorized</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 text-xs">
                    {formatDate(expense.date)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-xs text-slate-600 capitalize">
                      <CreditCard className="w-3 h-3 text-slate-400" />
                      {expense.payment_method.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600">
                    -{formatCurrency(Number(expense.amount))}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(expense)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Edit Expense"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingId(expense.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deletingId}
        title="Delete Expense Record"
        message="Are you sure you want to delete this expense record? This action cannot be undone."
        confirmLabel="Delete Record"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </>
  );
}
