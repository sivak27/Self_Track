import React from "react";
import { StatCard } from "@/components/common/StatCard";
import { FinancialSummary } from "@/types/analytics";
import { TrendingUp, TrendingDown, PiggyBank, Percent } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";

interface FinancialOverviewCardsProps {
  financial: FinancialSummary;
}

export function FinancialOverviewCards({ financial }: FinancialOverviewCardsProps) {
  const availableInflow = financial.availableIncome ?? financial.totalIncome;
  const pendingInflow = financial.pendingIncome ?? 0;
  const currentBalance = financial.currentBalance ?? financial.netSavings;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Realized Inflow"
        value={formatCurrency(availableInflow)}
        subtext={
          pendingInflow > 0
            ? `+${formatCurrency(pendingInflow)} pending receivable`
            : "Available money (cleared + in-hand)"
        }
        icon={TrendingUp}
        colorScheme="mint"
      />
      <StatCard
        title="Total Outflow"
        value={formatCurrency(financial.totalExpenses)}
        subtext="Operating costs & spending"
        icon={TrendingDown}
        colorScheme="rose"
      />
      <StatCard
        title="Net Capital Balance"
        value={formatCurrency(currentBalance)}
        subtext={currentBalance >= 0 ? "Liquid capital available" : "Deficit burn"}
        icon={PiggyBank}
        colorScheme={currentBalance >= 0 ? "cyan" : "rose"}
      />
      <StatCard
        title="Savings Rate"
        value={`${financial.savingsRate}%`}
        subtext={
          financial.topExpenseCategory
            ? `Top cost: ${financial.topExpenseCategory.name} (${financial.topExpenseCategory.percentage}%)`
            : "No expense concentration"
        }
        icon={Percent}
        colorScheme="indigo"
      />
    </div>
  );
}
