"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  subtext?: string;
  disabled?: boolean;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  subtext,
  disabled = false,
  className,
}) => {
  return (
    <label
      className={cn(
        "inline-flex items-center gap-3 select-none cursor-pointer group",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-[#3b86ff]/25",
          checked
            ? "bg-[#3b86ff] shadow-[0_0_12px_rgba(59,134,255,0.45)]"
            : "bg-[#dae7ff] group-hover:bg-[#b5d2ff] dark:bg-[#24272c] dark:group-hover:bg-[#2a2d33]"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
      {(label || subtext) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-xs font-semibold text-[#0c1836] dark:text-[#f1f4f9] group-hover:text-[#3b86ff] transition-colors">
              {label}
            </span>
          )}
          {subtext && (
            <span className="text-[11px] text-[#4d5b85] dark:text-[#9da4b0] font-normal">
              {subtext}
            </span>
          )}
        </div>
      )}
    </label>
  );
};
