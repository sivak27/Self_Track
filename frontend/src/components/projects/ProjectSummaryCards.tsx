import React from "react";
import { StatCard } from "@/components/common/StatCard";
import { FolderKanban, Activity, CheckCircle2, Compass } from "lucide-react";

interface ProjectSummaryCardsProps {
  totalCount: number;
  activeCount: number;
  completedCount: number;
  planningCount: number;
}

export function ProjectSummaryCards({
  totalCount,
  activeCount,
  completedCount,
  planningCount,
}: ProjectSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total Workspaces"
        value={totalCount}
        subtext="Initiatives in personal pipeline"
        icon={FolderKanban}
        colorScheme="cyan"
      />
      <StatCard
        title="Active Initiatives"
        value={activeCount}
        subtext="Currently in active execution"
        icon={Activity}
        colorScheme="mint"
      />
      <StatCard
        title="Completed"
        value={completedCount}
        subtext="Delivered & archived"
        icon={CheckCircle2}
        colorScheme="indigo"
      />
      <StatCard
        title="In Planning"
        value={planningCount}
        subtext="Scoped for upcoming sprints"
        icon={Compass}
        colorScheme="amber"
      />
    </div>
  );
}
