import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { BarChart3, Receipt, CheckSquare } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FinancialOverviewCards } from "@/components/dashboard/FinancialOverviewCards";
import { ProductivityOverviewCards } from "@/components/dashboard/ProductivityOverviewCards";
import { CashflowChart } from "@/components/dashboard/CashflowChart";
import { CategoryDonutChart } from "@/components/dashboard/CategoryDonutChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { useAnalytics } from "@/hooks/analytics/useAnalytics";

export function DashboardPage() {
  const { metrics, isLoading, error } = useAnalytics();

  useEffect(() => {
    document.title = "Personal Command Station | Personal Control Center";
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Command Station"
          description="Synthesizing private productivity, cashflow, and goal trajectories..."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <LoadingSkeleton count={4} className="h-28 w-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LoadingSkeleton className="h-80 w-full" />
          </div>
          <div>
            <LoadingSkeleton className="h-80 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="p-8 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm text-center">
        {error || "Failed to load dashboard metrics"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Personal Command Station"
        description="Private executive dashboard consolidating capital reserves, cashflow, and execution milestones."
      >
        <Link
          to="/expenses"
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 transition-colors shadow-xs"
        >
          <Receipt className="w-3.5 h-3.5 text-rose-600" />
          <span>Expenses</span>
        </Link>

        <Link
          to="/tasks"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm"
        >
          <CheckSquare className="w-4 h-4" />
          <span>Open Tasks</span>
        </Link>
      </PageHeader>

      {/* Financial KPIs */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Financial Health & Liquidity
          </span>
          <Link
            to="/analytics"
            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <BarChart3 className="w-3 h-3" />
            Detailed Analytics
          </Link>
        </div>
        <FinancialOverviewCards financial={metrics.financial} />
      </div>

      {/* Productivity KPIs */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Sprint Execution & Goals
          </span>
          <Link
            to="/projects"
            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Manage Projects →
          </Link>
        </div>
        <ProductivityOverviewCards productivity={metrics.productivity} />
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CashflowChart data={metrics.cashflowTrend} />
        </div>
        <div>
          <CategoryDonutChart data={metrics.expenseByCategory} />
        </div>
      </div>

      {/* Recent Feed */}
      <RecentActivity
        recentExpenses={metrics.recentExpenses}
        recentTasks={metrics.recentTasks}
        recentTransactions={metrics.recentTransactions}
      />
    </div>
  );
}
