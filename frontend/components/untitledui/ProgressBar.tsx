"use client";

import React from "react";
import { CheckCircle, Loading01 } from "@untitledui/icons";
import { cn } from "@/lib/utils";

export interface StepItem {
  id: string;
  label: string;
  threshold: number;
}

export interface ProgressBarProps {
  progress: number;
  stage?: string;
  steps?: StepItem[];
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  stage,
  steps,
  className,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div className={cn("space-y-4 w-full", className)}>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#3b86ff] animate-pulse" />
          <span className="font-semibold text-[#0c1836] dark:text-[#f1f4f9]">
            {stage || "Processing..."}
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono font-bold text-[#3b86ff]">
          <span>{clampedProgress}%</span>
        </div>
      </div>

      <div className="w-full bg-[#eef4ff] dark:bg-[#0b0c0e] h-3 rounded-full overflow-hidden p-0.5 border border-[#dae7ff] dark:border-[#2a2d33] shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-[#2563eb] via-[#3b86ff] to-[#6ea8ff] rounded-full transition-all duration-500 ease-out shadow-xs relative"
          style={{ width: `${clampedProgress}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]" />
        </div>
      </div>

      {steps && steps.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          {steps.map((s) => {
            const isDone = clampedProgress >= s.threshold;
            const isCurrent =
              clampedProgress < s.threshold &&
              steps.findIndex((x) => x.id === s.id) > 0 &&
              clampedProgress >= (steps[steps.findIndex((x) => x.id === s.id) - 1]?.threshold ?? 0);

            return (
              <div
                key={s.id}
                className={cn(
                  "p-2.5 rounded-xl border text-center text-xs transition-all flex items-center justify-center gap-1.5",
                  isDone
                    ? "border-[#b5d2ff] bg-[#eef4ff] text-[#2563eb] dark:border-[#3b86ff]/35 dark:bg-[#111e3e]/50 dark:text-[#85b5ff] font-semibold"
                    : isCurrent
                    ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-950/20 dark:text-amber-300 font-semibold"
                    : "border-[#dae7ff] bg-white text-[#6a748a] dark:border-[#2a2d33] dark:bg-[#1c1e22]/50 dark:text-[#9da4b0]"
                )}
              >
                {isDone ? (
                  <CheckCircle className="w-4 h-4 text-[#3b86ff] stroke-[2]" />
                ) : isCurrent ? (
                  <Loading01 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-spin stroke-[2]" />
                ) : null}
                <span>{s.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
