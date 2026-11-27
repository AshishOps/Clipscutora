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
            className="block text-xs font-medium text-[#4d5b85] dark:text-[#9da4b0] tracking-wide select-none"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "w-full appearance-none bg-white dark:bg-[#1c1e22] border border-[#dae7ff] dark:border-[#2a2d33] text-[#0c1836] dark:text-[#f1f4f9] shadow-xs transition-all duration-150 outline-none cursor-pointer",
              "focus:border-[#3b86ff] focus:ring-4 focus:ring-[#3b86ff]/20",
              "disabled:bg-[#eef4ff] dark:disabled:bg-[#141518] disabled:text-[#6a748a] disabled:cursor-not-allowed",
              error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/15",
              sizeClasses,
              className
            )}
            {...props}
          >
            {children}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#4d5b85] dark:text-[#9da4b0]">
            <ChevronDown className="w-4 h-4 stroke-[2]" />
          </div>
        </div>
        {hint && !error && <p className="text-[11px] text-[#4d5b85] dark:text-[#9da4b0]">{hint}</p>}
        {error && <p className="text-[11px] text-rose-500 dark:text-rose-400 font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
