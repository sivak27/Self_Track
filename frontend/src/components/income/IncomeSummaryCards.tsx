import React from "react";
import { StatCard } from "@/components/common/StatCard";
import { DollarSign, Clock, Building2, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";

interface IncomeSummaryCardsProps {
  totalRealized: number;
  totalDeposited: number;
  totalReceived: number;
  totalPending: number;
}

export function IncomeSummaryCards({
  totalRealized,
  totalDeposited,
  totalReceived,
  totalPending,
}: IncomeSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total Realized Inflow"
        value={formatCurrency(totalRealized)}
        subtext="Available money (Deposited + Received)"
        icon={DollarSign}
        colorScheme="mint"
      />
      <StatCard
        title="Deposited Inflow"
        value={formatCurrency(totalDeposited)}
        subtext="Cleared in tracked bank/account"
        icon={Building2}
        colorScheme="indigo"
      />
      <StatCard
        title="Received Inflow"
        value={formatCurrency(totalReceived)}
        subtext="Received in-hand, awaiting bank deposit"
        icon={Wallet}
        colorScheme="cyan"
      />
      <StatCard
        title="Pending / Expected"
        value={formatCurrency(totalPending)}
        subtext="Expected receivable (not in balance)"
        icon={Clock}
        colorScheme="amber"
      />
    </div>
  );
}
