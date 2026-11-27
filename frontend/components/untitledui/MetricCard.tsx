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
        "p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#141518] border border-[#dae7ff] dark:border-[#2a2d33] shadow-xs dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition-all hover:border-[#b5d2ff] dark:hover:border-[#3b86ff]/40 space-y-2.5",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#4d5b85] dark:text-[#9da4b0]">{label}</span>
        {icon && <div className="text-[#3b86ff]">{icon}</div>}
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-xl sm:text-2xl font-bold tracking-tight text-[#0c1836] dark:text-[#f1f4f9]">
          {value}
        </div>
        {badge && <div>{badge}</div>}
      </div>
      {hint && <p className="text-[11px] text-[#4d5b85] dark:text-[#9da4b0] font-normal">{hint}</p>}
    </div>
  );
};
