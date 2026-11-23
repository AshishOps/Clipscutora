"use client";

import React, { forwardRef } from "react";
import { Loading01 } from "@untitledui/icons";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "secondary-gray" | "tertiary" | "destructive";
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "px-3 py-1.5 text-xs font-semibold rounded-lg gap-1.5",
      md: "px-4 py-2 text-sm font-semibold rounded-xl gap-2",
      lg: "px-4.5 py-2.5 text-sm font-semibold rounded-xl gap-2",
      xl: "px-5 py-3 text-base font-semibold rounded-xl gap-2.5",
    }[size];

    const variantClasses = {
      primary:
        "bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white shadow-xs border border-brand-500/30 focus:ring-4 focus:ring-brand-500/20 disabled:bg-brand-300 dark:disabled:bg-brand-900/50 disabled:text-white/70 dark:disabled:text-brand-300/50 disabled:border-transparent",
      secondary:
        "bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 shadow-xs focus:ring-4 focus:ring-brand-500/10 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 dark:text-brand-300 dark:border-brand-800/60 disabled:opacity-50",
      "secondary-gray":
        "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-xs hover:border-gray-400 focus:ring-4 focus:ring-gray-200 dark:bg-zinc-900/80 dark:hover:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700/80 dark:hover:border-zinc-600 dark:focus:ring-zinc-700/20 disabled:opacity-40",
      tertiary:
        "bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-900 dark:hover:bg-zinc-800/60 dark:text-zinc-300 dark:hover:text-zinc-100 disabled:opacity-40",
      destructive:
        "bg-error-600 hover:bg-error-700 active:bg-error-800 text-white shadow-xs focus:ring-4 focus:ring-error-500/20 disabled:opacity-50",
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center transition-all duration-150 select-none outline-none cursor-pointer disabled:cursor-not-allowed",
          sizeClasses,
          variantClasses,
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loading01 className="w-4 h-4 animate-spin text-current stroke-[2]" />
        ) : (
          leftIcon && <span className="flex-none">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="flex-none">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
