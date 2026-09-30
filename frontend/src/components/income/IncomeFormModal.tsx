"use client";

import React, { useState, useEffect } from "react";
import { X, DollarSign, Calendar, Landmark, Check, AlertCircle, ShieldCheck } from "lucide-react";
import {
  Income,
  IncomeSource,
  CreateIncomeInput,
  IncomeSourceCategory,
  DepositStatus,
  INCOME_SOURCE_OPTIONS,
  DEPOSIT_STATUS_OPTIONS,
} from "@/types/income";
import { createIncomeSchema } from "@/lib/validations/income.schema";
import { getTodayDateString } from "@/lib/utils/date";

interface IncomeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateIncomeInput) => Promise<unknown>;
  incomeToEdit?: Income | null;
  sources: IncomeSource[];
}

export function IncomeFormModal({
  isOpen,
  onClose,
  onSubmit,
  incomeToEdit,
  sources,
}: IncomeFormModalProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [incomeSource, setIncomeSource] = useState<string>("");
  const [depositStatus, setDepositStatus] = useState<string>("");
  const [date, setDate] = useState(getTodayDateString());
  const [isRecurring, setIsRecurring] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (incomeToEdit) {
      setAmount(incomeToEdit.amount.toString());
      setDescription(incomeToEdit.description);
      setIncomeSource(incomeToEdit.income_source || "");
      setDepositStatus(incomeToEdit.deposit_status || "");
      setDate(incomeToEdit.date);
      setIsRecurring(incomeToEdit.is_recurring);
    } else {
      setAmount("");
      setDescription("");
      // Conscious selection required: no misleading default preselected
      setIncomeSource("");
      setDepositStatus("");
      setDate(getTodayDateString());
      setIsRecurring(false);
    }
    setErrors({});
  }, [incomeToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const fieldErrors: Record<string, string> = {};

    if (!incomeSource) {
      fieldErrors.income_source = "Please select an income source";
    }
    if (!depositStatus) {
      fieldErrors.deposit_status = "Please select a deposit status";
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      fieldErrors.amount = "Amount must be greater than zero";
    }

    if (!description.trim()) {
      fieldErrors.description = "Description is required";
    }

    if (!date) {
      fieldErrors.date = "Date is required";
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    // Match optional foreign key source_id from existing sources table
    const matchingSource = sources.find(
      (s) => s.type === incomeSource || s.name.toLowerCase().includes(incomeSource)
    );

    const payload: CreateIncomeInput = {
      amount: parsedAmount,
      description: description.trim(),
      income_source: incomeSource as IncomeSourceCategory,
      deposit_status: depositStatus as DepositStatus,
      source_id: matchingSource?.id || null,
      date,
      is_recurring: isRecurring,
    };

    const validation = createIncomeSchema.safeParse(payload);
    if (!validation.success) {
      validation.error.issues.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(payload);
      onClose();
    } catch (err: unknown) {
      setErrors({
        form: err instanceof Error ? err.message : "Failed to save income record",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {incomeToEdit ? "Edit Income Record" : "Record New Income"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Accurately track your real cash inflow and deposit status
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errors.form && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errors.form}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Amount ($ USD) *
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3" />
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
                  required
                />
              </div>
              {errors.amount && <p className="text-xs text-rose-600 mt-1">{errors.amount}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Date *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
                  required
                />
              </div>
              {errors.date && <p className="text-xs text-rose-600 mt-1">{errors.date}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Description / Client *
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Monthly Salary, Freelance Web App, Investment Return..."
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
              required
            />
            {errors.description && <p className="text-xs text-rose-600 mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Income Source *
              </label>
              <div className="relative">
                <Landmark className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <select
                  value={incomeSource}
                  onChange={(e) => setIncomeSource(e.target.value)}
                  className={`w-full appearance-none pl-10 pr-8 py-2.5 rounded-xl bg-white border text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs ${
                    errors.income_source ? "border-rose-300 text-rose-900" : "border-slate-300 text-slate-900"
                  }`}
                  required
                >
                  <option value="" disabled>
                    Select income source
                  </option>
                  {INCOME_SOURCE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              {errors.income_source && (
                <p className="text-xs text-rose-600 mt-1">{errors.income_source}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Deposit Status *
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <select
                  value={depositStatus}
                  onChange={(e) => setDepositStatus(e.target.value)}
                  className={`w-full appearance-none pl-10 pr-8 py-2.5 rounded-xl bg-white border text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs ${
                    errors.deposit_status ? "border-rose-300 text-rose-900" : "border-slate-300 text-slate-900"
                  }`}
                  required
                >
                  <option value="" disabled>
                    Select deposit status
                  </option>
                  {DEPOSIT_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              {errors.deposit_status && (
                <p className="text-xs text-rose-600 mt-1">{errors.deposit_status}</p>
              )}
            </div>
          </div>

          {/* Status description explanation */}
          {depositStatus && (
            <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              {depositStatus === "received" && (
                <span><strong>Received:</strong> Money has been received in hand, but is not yet deposited into your tracked account.</span>
              )}
              {depositStatus === "deposited" && (
                <span><strong>Deposited:</strong> Money has cleared and is currently deposited in your bank / tracked account.</span>
              )}
              {depositStatus === "pending" && (
                <span><strong>Pending / Expected:</strong> Invoiced or expected receivable. Not yet received or counted in available cash.</span>
              )}
            </div>
          )}

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-medium text-slate-700">
                Mark as recurring monthly revenue stream
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? "Saving..." : incomeToEdit ? "Update Income" : "Add Income"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
