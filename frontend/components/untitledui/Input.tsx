"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  hint?: string;
  error?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  trailingAction?: React.ReactNode;
  inputSize?: "sm" | "md" | "lg";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      hint,
      error,
      leadingIcon,
      trailingIcon,
      trailingAction,
      inputSize = "md",
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    const sizeClasses = {
      sm: "py-2 text-xs rounded-lg",
      md: "py-2.5 text-sm rounded-xl",
      lg: "py-3 text-base rounded-xl",
    }[inputSize];

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-[#4d5b85] dark:text-[#9da4b0] tracking-wide select-none"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leadingIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[#6a748a] dark:text-[#9da4b0]">
              {leadingIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              "w-full bg-white dark:bg-[#1c1e22] border border-[#dae7ff] dark:border-[#2a2d33] text-[#0c1836] dark:text-[#f1f4f9] placeholder:text-[#6a748a] dark:placeholder:text-[#9da4b0]/75 shadow-xs transition-all duration-150 outline-none",
              "focus:border-[#3b86ff] focus:ring-4 focus:ring-[#3b86ff]/20",
              "disabled:bg-[#eef4ff] dark:disabled:bg-[#141518] disabled:text-[#6a748a] disabled:cursor-not-allowed",
              error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/15",
              leadingIcon ? "pl-10" : "pl-3.5",
              trailingIcon || trailingAction ? "pr-10" : "pr-3.5",
              sizeClasses,
              className
            )}
            {...props}
          />
          {trailingIcon && !trailingAction && (
            <div className="absolute right-3.5 flex items-center pointer-events-none text-[#6a748a] dark:text-[#9da4b0]">
              {trailingIcon}
            </div>
          )}
          {trailingAction && (
            <div className="absolute right-1.5 flex items-center">
              {trailingAction}
            </div>
          )}
        </div>
        {hint && !error && <p className="text-[11px] text-[#4d5b85] dark:text-[#9da4b0]">{hint}</p>}
        {error && <p className="text-[11px] text-rose-500 dark:text-rose-400 font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
