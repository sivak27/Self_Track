import React from "react";
import { StatCard } from "@/components/common/StatCard";
import { Target, Trophy, TrendingUp, PiggyBank } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";

interface GoalSummaryCardsProps {
  totalCount: number;
  achievedCount: number;
  inProgressCount: number;
  savingsTotal: number;
}

export function GoalSummaryCards({
  totalCount,
  achievedCount,
  inProgressCount,
  savingsTotal,
}: GoalSummaryCardsProps) {
  const successRate = totalCount > 0 ? Math.round((achievedCount / totalCount) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Active Life Goals"
        value={totalCount}
        subtext="Financial & personal targets"
        icon={Target}
        colorScheme="cyan"
      />
      <StatCard
        title="Achieved Milestones"
        value={achievedCount}
        subtext={`${successRate}% target completion rate`}
        icon={Trophy}
        colorScheme="mint"
      />
      <StatCard
        title="In Motion"
        value={inProgressCount}
        subtext="Under active pursuit"
        icon={TrendingUp}
        colorScheme="indigo"
      />
      <StatCard
        title="Accumulated Savings"
        value={formatCurrency(savingsTotal)}
        subtext="Progress in savings goals"
        icon={PiggyBank}
        colorScheme="amber"
      />
    </div>
  );
}
