"use client";

import React, { forwardRef } from "react";
import { ChevronDown } from "@untitledui/icons";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  selectSize?: "sm" | "md" | "lg";
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, hint, error, selectSize = "md", children, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    const sizeClasses = {
      sm: "py-2 pl-3 pr-8 text-xs rounded-lg",
      md: "py-2.5 pl-3.5 pr-10 text-sm rounded-xl",
      lg: "py-3 pl-4 pr-12 text-base rounded-xl",
    }[selectSize];

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-medium text-gray-700 dark:text-zinc-300 tracking-wide select-none"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "w-full appearance-none bg-white dark:bg-zinc-950/70 border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 shadow-xs transition-all duration-150 outline-none cursor-pointer",
              "focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15",
              "disabled:bg-gray-50 dark:disabled:bg-zinc-900/50 disabled:text-gray-400 dark:disabled:text-zinc-500 disabled:cursor-not-allowed",
              error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/15",
              sizeClasses,
              className
            )}
            {...props}
          >
            {children}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-zinc-400">
            <ChevronDown className="w-4 h-4 stroke-[2]" />
          </div>
        </div>
        {hint && !error && <p className="text-[11px] text-gray-500 dark:text-zinc-400">{hint}</p>}
        {error && <p className="text-[11px] text-rose-500 dark:text-rose-400 font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
