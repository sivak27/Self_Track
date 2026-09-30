import React from "react";
import { StatCard } from "@/components/common/StatCard";
import { CheckSquare, Flame, Clock, AlertTriangle } from "lucide-react";

interface TaskSummaryCardsProps {
  totalCount: number;
  completedCount: number;
  inProgressCount: number;
  urgentCount: number;
}

export function TaskSummaryCards({
  totalCount,
  completedCount,
  inProgressCount,
  urgentCount,
}: TaskSummaryCardsProps) {
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total Action Items"
        value={totalCount}
        subtext="Across all projects & backlogs"
        icon={CheckSquare}
        colorScheme="cyan"
      />
      <StatCard
        title="Completed"
        value={completedCount}
        subtext={`${completionRate}% throughput rate`}
        icon={Flame}
        colorScheme="mint"
      />
      <StatCard
        title="In Flight"
        value={inProgressCount}
        subtext="Actively being executed"
        icon={Clock}
        colorScheme="indigo"
      />
      <StatCard
        title="Urgent Attention"
        value={urgentCount}
        subtext={urgentCount > 0 ? "High priority bottlenecks" : "No urgent bottlenecks"}
        icon={AlertTriangle}
        colorScheme={urgentCount > 0 ? "rose" : "mint"}
      />
    </div>
  );
}
