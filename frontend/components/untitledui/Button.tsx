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
      sm: "px-3.5 py-1.5 text-xs font-semibold rounded-full gap-1.5",
      md: "px-4 py-2 text-sm font-semibold rounded-xl gap-2",
      lg: "px-5 py-2.5 text-sm font-semibold rounded-xl gap-2",
      xl: "px-6 py-3.5 text-base font-semibold rounded-full gap-2.5",
    }[size];

    const variantClasses = {
      primary:
        "btn-lit bg-[#3b86ff] hover:bg-[#5a9aff] active:bg-[#2563eb] text-white border border-white/15 focus:ring-4 focus:ring-[#3b86ff]/25 disabled:opacity-45 disabled:shadow-none",
      secondary:
        "bg-[#eef4ff] hover:bg-[#d6e6ff] text-[#2563eb] border border-[#b5d2ff] shadow-xs focus:ring-4 focus:ring-[#3b86ff]/15 dark:bg-[#111e3e]/70 dark:hover:bg-[#1e3a8a]/60 dark:text-[#85b5ff] dark:border-[#3b86ff]/30 disabled:opacity-50",
      "secondary-gray":
        "bg-white hover:bg-[#eef4ff] text-[#0c1836] border border-[#dae7ff] shadow-xs hover:border-[#b5d2ff] focus:ring-4 focus:ring-[#3b86ff]/15 dark:bg-[#1c1e22] dark:hover:bg-[#24272c] dark:text-[#f1f4f9] dark:border-[#2a2d33] dark:hover:border-[#3b86ff]/40 disabled:opacity-40",
      tertiary:
        "bg-transparent hover:bg-[#eef4ff] text-[#4d5b85] hover:text-[#0c1836] dark:hover:bg-[#1c1e22] dark:text-[#9da4b0] dark:hover:text-[#f1f4f9] disabled:opacity-40",
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
        <span className="relative z-10">{children}</span>
        {!isLoading && rightIcon && <span className="flex-none">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
