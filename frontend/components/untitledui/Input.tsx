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
            className="block text-xs font-medium text-gray-700 dark:text-zinc-300 tracking-wide select-none"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leadingIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-gray-400 dark:text-zinc-500">
              {leadingIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              "w-full bg-white dark:bg-zinc-950/70 border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 shadow-xs transition-all duration-150 outline-none",
              "focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15",
              "disabled:bg-gray-50 dark:disabled:bg-zinc-900/50 disabled:text-gray-400 dark:disabled:text-zinc-500 disabled:cursor-not-allowed",
              error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/15",
              leadingIcon ? "pl-10" : "pl-3.5",
              trailingIcon || trailingAction ? "pr-10" : "pr-3.5",
              sizeClasses,
              className
            )}
            {...props}
          />
          {trailingIcon && !trailingAction && (
            <div className="absolute right-3.5 flex items-center pointer-events-none text-gray-400 dark:text-zinc-500">
              {trailingIcon}
            </div>
          )}
          {trailingAction && (
            <div className="absolute right-1.5 flex items-center">
              {trailingAction}
            </div>
          )}
        </div>
        {hint && !error && <p className="text-[11px] text-gray-500 dark:text-zinc-400">{hint}</p>}
        {error && <p className="text-[11px] text-rose-500 dark:text-rose-400 font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
