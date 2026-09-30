import React from "react";
import { cn } from "@/lib/utils/cn";

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
}

export function LoadingSkeleton({ className, count = 1 }: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "animate-pulse rounded-xl bg-slate-200",
            className || "h-12 w-full"
          )}
        />
      ))}
    </>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl p-5 border border-slate-200 bg-white animate-pulse space-y-4 shadow-xs">
      <div className="flex justify-between items-center">
        <div className="h-4 w-24 bg-slate-200 rounded" />
        <div className="w-8 h-8 rounded-lg bg-slate-200" />
      </div>
      <div className="h-7 w-32 bg-slate-200 rounded" />
      <div className="h-3 w-20 bg-slate-200 rounded" />
    </div>
  );
}
