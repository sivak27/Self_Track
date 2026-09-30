"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { CategoryExpensePoint } from "@/types/analytics";
import { formatCurrency } from "@/lib/utils/currency";

interface CategoryDonutChartProps {
  data: CategoryExpensePoint[];
}

export function CategoryDonutChart({ data }: CategoryDonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);

  if (data.length === 0 || total === 0) {
    return (
      <div className="rounded-2xl p-5 border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Category Breakdown</h3>
          <p className="text-xs text-slate-500 mt-0.5">Distribution of spending</p>
        </div>
        <div className="h-64 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <p className="text-xs font-bold text-slate-800">Not enough data yet.</p>
          <p className="text-[11px] text-slate-500 mt-1 max-w-[200px]">
            Add expenses to see category breakdown.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5 border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Category Breakdown</h3>
          <p className="text-xs text-slate-500 mt-0.5">Distribution of spending</p>
        </div>
        <span className="text-xs font-mono font-bold text-indigo-600">
          {formatCurrency(total)}
        </span>
      </div>

      <div className="h-60 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="amount"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as CategoryExpensePoint;
                  const pct = total > 0 ? Math.round((item.amount / total) * 100) : 0;
                  return (
                    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl text-xs font-mono space-y-1">
                      <p className="font-sans font-bold text-slate-900">{item.name}</p>
                      <p className="text-indigo-600 font-semibold">{formatCurrency(item.amount)}</p>
                      <p className="text-slate-500 text-[10px]">{pct}% of total outflow</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Category pills list */}
      <div className="mt-2 flex flex-wrap items-center gap-2 max-h-20 overflow-y-auto pr-1">
        {data.slice(0, 5).map((item, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-50 border border-slate-200 text-slate-700"
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="truncate max-w-[100px]">{item.name}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
