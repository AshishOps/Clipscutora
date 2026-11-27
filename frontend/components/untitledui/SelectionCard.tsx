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
        "relative group flex flex-col justify-between p-3.5 rounded-2xl border text-left cursor-pointer transition-all duration-200 select-none outline-none",
        selected
          ? "border-[#3b86ff]/85 bg-[#eef4ff] dark:bg-[#131d33]/90 ring-2 ring-[#3b86ff]/25 shadow-[0_0_26px_-14px_rgba(59,134,255,0.65)]"
          : "border-[#dae7ff] dark:border-[#2a2d33] bg-white dark:bg-[#111216]/90 hover:border-[#b5d2ff] dark:hover:border-[#3b86ff]/40 hover:bg-[#f5f8ff] dark:hover:bg-[#181a20] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          {icon && (
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                selected
                  ? "bg-[#3b86ff]/15 text-[#2563eb] dark:text-[#85b5ff] border border-[#3b86ff]/30"
                  : "bg-[#eef4ff] dark:bg-[#1c1e22] text-[#4d5b85] dark:text-[#9da4b0] border border-[#dae7ff] dark:border-[#2a2d33]"
              )}
            >
              {icon}
            </div>
          )}
          {badge}
        </div>

        <div
          className={cn(
            "w-5 h-5 rounded-full flex items-center justify-center transition-all duration-150 flex-none",
            selected
              ? "bg-[#3b86ff] text-white shadow-[0_0_10px_rgba(59,134,255,0.6)]"
              : "border border-[#dae7ff] dark:border-[#2a2d33] bg-[#eef4ff] dark:bg-[#1c1e22] group-hover:border-[#3b86ff]/50"
          )}
        >
          {selected && <Check className="w-3 h-3 stroke-[2.5]" />}
        </div>
      </div>

      {preview && <div className="my-1.5">{preview}</div>}

      <div className="space-y-0.5 mt-1">
        <div className="text-xs font-semibold text-[#0c1836] dark:text-[#f1f4f9] transition-colors">
          {title}
        </div>
        {description && (
          <p className="text-[11px] text-[#4d5b85] dark:text-[#9da4b0] leading-normal line-clamp-2 font-normal">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
