import React from "react";
import { StatCard } from "@/components/common/StatCard";
import { ProductivitySummary } from "@/types/analytics";
import { CheckCircle2, FolderKanban, Target, Flame } from "lucide-react";

interface ProductivityOverviewCardsProps {
  productivity: ProductivitySummary;
}

export function ProductivityOverviewCards({ productivity }: ProductivityOverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Execution Velocity"
        value={`${productivity.completionRate}%`}
        subtext={`${productivity.completedTasks}/${productivity.totalTasks} tasks completed`}
        icon={Flame}
        colorScheme="mint"
      />
      <StatCard
        title="Active Workspaces"
        value={productivity.activeProjects}
        subtext={`${productivity.completedProjects} delivered projects`}
        icon={FolderKanban}
        colorScheme="cyan"
      />
      <StatCard
        title="Goals Achieved"
        value={productivity.achievedGoals}
        subtext={`${productivity.activeGoals} targets in pursuit`}
        icon={Target}
        colorScheme="indigo"
      />
      <StatCard
        title="Pending Items"
        value={productivity.pendingTasks}
        subtext="Immediate action backlog"
        icon={CheckCircle2}
        colorScheme={productivity.pendingTasks > 10 ? "amber" : "cyan"}
      />
    </div>
  );
}
