import React from "react";
import { cn } from "@/lib/utils/cn";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  icon: LucideIcon;
  colorScheme?: "cyan" | "mint" | "amber" | "rose" | "indigo";
}

const colorVariants = {
  cyan: {
    bg: "bg-sky-50",
    text: "text-sky-600",
    border: "border-sky-200",
    glow: "hover:border-sky-300",
  },
  mint: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
    glow: "hover:border-emerald-300",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
    glow: "hover:border-amber-300",
  },
  rose: {
    bg: "bg-rose-50",
    text: "text-rose-600",
    border: "border-rose-200",
    glow: "hover:border-rose-300",
  },
  indigo: {
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    border: "border-indigo-200",
    glow: "hover:border-indigo-300",
  },
};

export function StatCard({
  title,
  value,
  subtext,
  trend,
  icon: Icon,
  colorScheme = "cyan",
}: StatCardProps) {
  const styles = colorVariants[colorScheme];

  return (
    <div
      className={cn(
        "rounded-2xl p-5 border border-slate-200 bg-white transition-all duration-200 shadow-xs hover:shadow-md hover:border-slate-300"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={cn("p-2.5 rounded-xl border", styles.bg, styles.text, styles.border)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
        <div className="mt-1.5 flex items-center gap-2">
          {trend && (
            <span
              className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded-md",
                trend.isPositive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
              )}
            >
              {trend.value}
            </span>
          )}
          {subtext && <span className="text-xs text-slate-500">{subtext}</span>}
        </div>
      </div>
    </div>
  );
}
