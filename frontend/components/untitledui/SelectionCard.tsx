"use client";

import React from "react";
import { Check } from "@untitledui/icons";
import { cn } from "@/lib/utils";

export interface SelectionCardProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  preview?: React.ReactNode;
}

export const SelectionCard: React.FC<SelectionCardProps> = ({
  title,
  description,
  badge,
  icon,
  selected = false,
  onClick,
  className,
  preview,
}) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={cn(
        "relative group flex flex-col justify-between p-4 rounded-2xl border text-left cursor-pointer transition-all duration-200 select-none outline-none",
        selected
          ? "border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 ring-4 ring-brand-500/10 dark:ring-brand-500/15 shadow-sm"
          : "border-gray-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950/50 hover:border-gray-300 dark:hover:border-zinc-700 hover:bg-gray-50/50 dark:hover:bg-zinc-900/50 shadow-xs",
        className
      )}
    >
      {/* Top row: Icon / Preview & Selection Indicator */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          {icon && (
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                selected
                  ? "bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-700/50"
                  : "bg-gray-100 dark:bg-zinc-900 text-gray-500 dark:text-zinc-400 border border-gray-200 dark:border-zinc-800"
              )}
            >
              {icon}
            </div>
          )}
          {badge}
        </div>

        {/* Untitled UI Selection Check Circle */}
        <div
          className={cn(
            "w-5 h-5 rounded-full flex items-center justify-center transition-all duration-150 flex-none",
            selected
              ? "bg-brand-600 text-white shadow-xs"
              : "border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900/50 group-hover:border-gray-400 dark:group-hover:border-zinc-600"
          )}
        >
          {selected && <Check className="w-3 h-3 stroke-[2.5]" />}
        </div>
      </div>

      {preview && <div className="my-2">{preview}</div>}

      {/* Title & Description */}
      <div className="space-y-1">
        <div className="text-xs font-semibold text-gray-900 dark:text-zinc-100 transition-colors">
          {title}
        </div>
        {description && (
          <p className="text-[11px] text-gray-500 dark:text-zinc-400 leading-normal line-clamp-2 font-normal">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
