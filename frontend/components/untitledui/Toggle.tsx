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
          "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-brand-500/20",
          checked
            ? "bg-brand-600"
            : "bg-gray-200 group-hover:bg-gray-300 dark:bg-zinc-800 dark:group-hover:bg-zinc-700"
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
            <span className="text-xs font-semibold text-gray-900 dark:text-zinc-200 group-hover:text-brand-600 dark:group-hover:text-zinc-100 transition-colors">
              {label}
            </span>
          )}
          {subtext && (
            <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-normal">
              {subtext}
            </span>
          )}
        </div>
      )}
    </label>
  );
};
