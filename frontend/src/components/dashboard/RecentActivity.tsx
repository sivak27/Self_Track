import React from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { Receipt, CheckSquare, ArrowUpRight, TrendingUp } from "lucide-react";
import { RecentTransactionItem } from "@/types/analytics";

interface RecentActivityProps {
  recentExpenses: Array<{
    id: string;
    description: string;
    amount: number;
    categoryName: string;
    categoryColor: string;
    date: string;
    type?: "expense";
  }>;
  recentTasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    projectTitle?: string;
    due_date?: string | null;
  }>;
  recentTransactions?: RecentTransactionItem[];
}

export function RecentActivity({
  recentExpenses,
  recentTasks,
  recentTransactions,
}: RecentActivityProps) {
  // Use combined recent transactions if available, otherwise fallback to recentExpenses
  const transactions: Array<{
    id: string;
    description: string;
    amount: number;
    categoryName: string;
    categoryColor: string;
    date: string;
    type?: "expense" | "income";
    depositStatus?: string;
  }> = recentTransactions && recentTransactions.length > 0
    ? recentTransactions
    : recentExpenses;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Transactions */}
      <div className="rounded-2xl p-5 border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Recent Transactions</h3>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/income"
                className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 font-semibold"
              >
                Inflow <ArrowUpRight className="w-3 h-3" />
              </Link>
              <Link
                to="/expenses"
                className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 font-semibold"
              >
                Outflow <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="space-y-2.5">
            {transactions.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No recent transactions recorded</p>
            ) : (
              transactions.map((tx) => {
                const isIncome = tx.type === "income";
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: tx.categoryColor }}
                      />
                      <div>
                        <p className="text-xs font-semibold text-slate-900 truncate max-w-[180px] sm:max-w-[240px]">
                          {tx.description}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {tx.categoryName} • {formatDate(tx.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {tx.type === "income" && tx.depositStatus && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                            tx.depositStatus === "deposited"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : tx.depositStatus === "received"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {tx.depositStatus === "deposited"
                            ? "Deposited"
                            : tx.depositStatus === "received"
                            ? "Received"
                            : "Pending"}
                        </span>
                      )}
                      <span
                        className={`font-mono text-xs font-bold ${
                          isIncome
                            ? tx.depositStatus === "pending"
                              ? "text-amber-600"
                              : "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {isIncome ? "+" : "-"}{formatCurrency(tx.amount)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Immediate Tasks */}
      <div className="rounded-2xl p-5 border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Immediate Action Items</h3>
            </div>
            <Link
              to="/tasks"
              className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-semibold"
            >
              Task Board <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentTasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No pending action items!</p>
            ) : (
              recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="text-xs font-semibold text-slate-900 truncate">{task.title}</p>
                    <p className="text-[10px] text-slate-500">
                      {task.projectTitle ? `${task.projectTitle} • ` : ""}
                      {task.due_date ? `Due ${formatDate(task.due_date)}` : "No due date"}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md border border-slate-200 bg-slate-100 text-slate-700">
                    {task.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
