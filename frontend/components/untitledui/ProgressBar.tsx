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
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
          <span className="font-semibold text-gray-700 dark:text-zinc-200">
            {stage || "Processing..."}
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono font-bold text-brand-600 dark:text-brand-300">
          <span>{clampedProgress}%</span>
        </div>
      </div>

      {/* Progress track */}
      <div className="w-full bg-gray-100 dark:bg-zinc-950/80 h-3 rounded-full overflow-hidden p-0.5 border border-gray-200 dark:border-zinc-800 shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-500 rounded-full transition-all duration-500 ease-out shadow-xs relative"
          style={{ width: `${clampedProgress}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]" />
        </div>
      </div>

      {/* Steps indicator */}
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
                    ? "border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-500/30 dark:bg-brand-950/30 dark:text-brand-300 font-semibold"
                    : isCurrent
                    ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-950/20 dark:text-amber-300 font-semibold"
                    : "border-gray-200 bg-gray-50/60 text-gray-400 dark:border-zinc-800/60 dark:bg-zinc-950/30 dark:text-zinc-500"
                )}
              >
                {isDone ? (
                  <CheckCircle className="w-4 h-4 text-brand-600 dark:text-brand-400 stroke-[2]" />
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
