"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface MetricCardProps {
  label: string;
  value: string | number;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  hint?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  badge,
  icon,
  hint,
  className,
}) => {
  return (
    <div
      className={cn(
        "p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800/80 shadow-xs transition-all hover:border-gray-300 dark:hover:border-zinc-700/80 space-y-3",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 dark:text-zinc-400">{label}</span>
        {icon && <div className="text-gray-400 dark:text-zinc-500">{icon}</div>}
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <div className="text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 font-sans">{value}</div>
        {badge && <div>{badge}</div>}
      </div>
      {hint && <p className="text-[11px] text-gray-500 dark:text-zinc-500 font-normal">{hint}</p>}
    </div>
  );
};
