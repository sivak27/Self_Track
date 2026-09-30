import React, { useEffect } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { CashflowChart } from "@/components/dashboard/CashflowChart";
import { CategoryDonutChart } from "@/components/dashboard/CategoryDonutChart";
import { StatCard } from "@/components/common/StatCard";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { useAnalytics } from "@/hooks/analytics/useAnalytics";
import { formatCurrency } from "@/utils/currency";
import { TrendingUp, Flame, Wallet, CheckCircle2 } from "lucide-react";

export function AnalyticsPage() {
  const { metrics, isLoading, error } = useAnalytics();

  useEffect(() => {
    document.title = "Analytics & Insights | Personal Control Center";
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Deep Analytics & Insights"
          description="Computing quantitative productivity indexes and financial burn rates..."
        />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <LoadingSkeleton count={4} className="h-28 w-full" />
        </div>
        <LoadingSkeleton className="h-80 w-full" />
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="p-8 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm text-center">
        {error || "Failed to load analytics"}
      </div>
    );
  }

  // Monthly burn rate calculation
  const totalMonthsRecorded = Math.max(1, metrics.cashflowTrend.filter((m) => m.expenses > 0).length);
  const avgMonthlyBurn = metrics.financial.totalExpenses / totalMonthsRecorded;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Deep Quantitative Analytics"
        description="Comprehensive analysis of capital preservation, spending burn rates, and execution throughput."
      />

      {/* High-level performance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Savings Velocity"
          value={`${metrics.financial.savingsRate}%`}
          subtext="Net capital retention"
          icon={TrendingUp}
          colorScheme="mint"
        />
        <StatCard
          title="Monthly Burn Rate"
          value={formatCurrency(avgMonthlyBurn)}
          subtext="Average outflow run-rate"
          icon={Wallet}
          colorScheme="rose"
        />
        <StatCard
          title="Execution Index"
          value={`${metrics.productivity.completionRate}%`}
          subtext="Task delivery ratio"
          icon={Flame}
          colorScheme="cyan"
        />
        <StatCard
          title="Milestone Delivery"
          value={metrics.productivity.achievedGoals}
          subtext="Completed major life goals"
          icon={CheckCircle2}
          colorScheme="indigo"
        />
      </div>

      {/* Main Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CashflowChart data={metrics.cashflowTrend} />
        </div>
        <div>
          <CategoryDonutChart data={metrics.expenseByCategory} />
        </div>
      </div>

      {/* Cashflow Breakdown Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Monthly Performance Historical Breakdown
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Detailed chronological cashflow log for the preceding 6 months
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-5">Month Period</th>
                <th className="py-3 px-5 text-right">Inflow ($)</th>
                <th className="py-3 px-5 text-right">Outflow ($)</th>
                <th className="py-3 px-5 text-right">Net Savings ($)</th>
                <th className="py-3 px-5 text-right">Savings Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!metrics.cashflowTrend.some((m) => m.income > 0 || m.expenses > 0) ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                    No financial data available yet. Add income and expenses to view historical performance breakdown.
                  </td>
                </tr>
              ) : (
                metrics.cashflowTrend.map((m, idx) => {
                  const monthSavingsRate = m.income > 0 ? Math.round((m.savings / m.income) * 100) : 0;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-slate-900">{m.month}</td>
                      <td className="py-3.5 px-5 text-right font-mono text-emerald-600">
                        +{formatCurrency(m.income)}
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono text-rose-600">
                        -{formatCurrency(m.expenses)}
                      </td>
                      <td
                        className={`py-3.5 px-5 text-right font-mono font-bold ${
                          m.savings >= 0 ? "text-indigo-600" : "text-rose-600"
                        }`}
                      >
                        {formatCurrency(m.savings)}
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono text-xs text-slate-600">
                        {monthSavingsRate}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
