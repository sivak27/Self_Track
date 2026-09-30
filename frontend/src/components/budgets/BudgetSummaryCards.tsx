import React from "react";
import { StatCard } from "@/components/common/StatCard";
import { PieChart, AlertOctagon, ShieldCheck, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";

interface BudgetSummaryCardsProps {
  totalAllocated: number;
  totalSpent: number;
  totalRemaining: number;
  overBudgetCount: number;
}

export function BudgetSummaryCards({
  totalAllocated,
  totalSpent,
  totalRemaining,
  overBudgetCount,
}: BudgetSummaryCardsProps) {
  const overallUsedPct = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total Budget Limit"
        value={formatCurrency(totalAllocated)}
        subtext="Monthly envelope ceiling"
        icon={PieChart}
        colorScheme="cyan"
      />
      <StatCard
        title="Current Utilization"
        value={formatCurrency(totalSpent)}
        subtext={`${overallUsedPct}% of allocation consumed`}
        icon={Wallet}
        colorScheme={overallUsedPct > 85 ? "rose" : "indigo"}
      />
      <StatCard
        title="Remaining Cushion"
        value={formatCurrency(totalRemaining)}
        subtext="Safe spend capacity"
        icon={ShieldCheck}
        colorScheme="mint"
      />
      <StatCard
        title="Over-Limit Envelopes"
        value={overBudgetCount}
        subtext={overBudgetCount > 0 ? "Requires spending freeze" : "All envelopes healthy"}
        icon={AlertOctagon}
        colorScheme={overBudgetCount > 0 ? "rose" : "mint"}
      />
    </div>
  );
}
