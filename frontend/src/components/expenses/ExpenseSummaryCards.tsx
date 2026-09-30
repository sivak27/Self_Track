import React from "react";
import { StatCard } from "@/components/common/StatCard";
import { CreditCard, Repeat, Tags, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";

interface ExpenseSummaryCardsProps {
  totalAmount: number;
  recurringTotal: number;
  count: number;
  categoriesCount: number;
}

export function ExpenseSummaryCards({
  totalAmount,
  recurringTotal,
  count,
  categoriesCount,
}: ExpenseSummaryCardsProps) {
  const avgExpense = count > 0 ? totalAmount / count : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total Outflow"
        value={formatCurrency(totalAmount)}
        subtext={`${count} transactions recorded`}
        icon={CreditCard}
        colorScheme="rose"
      />
      <StatCard
        title="Recurring Monthly"
        value={formatCurrency(recurringTotal)}
        subtext="Subscriptions & fixed bills"
        icon={Repeat}
        colorScheme="amber"
      />
      <StatCard
        title="Average Expense"
        value={formatCurrency(avgExpense)}
        subtext="Per recorded transaction"
        icon={TrendingDown}
        colorScheme="indigo"
      />
      <StatCard
        title="Categories Used"
        value={categoriesCount}
        subtext="Classified budget envelopes"
        icon={Tags}
        colorScheme="cyan"
      />
    </div>
  );
}
