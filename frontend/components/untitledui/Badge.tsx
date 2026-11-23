"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "brand" | "gray" | "success" | "warning" | "error" | "blue" | "purple" | "rose" | "amber";
  size?: "sm" | "md" | "lg";
  dot?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "brand",
  size = "md",
  dot = false,
  leftIcon,
  rightIcon,
  children,
  ...props
}) => {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px] gap-1.5 font-medium rounded-md",
    md: "px-2.5 py-0.5 text-xs gap-1.5 font-medium rounded-full",
    lg: "px-3 py-1 text-sm gap-2 font-medium rounded-full",
  }[size];

  const variantClasses = {
    brand: "bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-950/70 dark:text-brand-300 dark:border-brand-800/60",
    gray: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-zinc-800/80 dark:text-zinc-300 dark:border-zinc-700/60",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/60",
    warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800/60",
    error: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800/60",
    blue: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800/60",
    purple: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800/60",
    rose: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800/60",
    amber: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800/60",
  }[variant];

  const dotColorClasses = {
    brand: "bg-brand-500 dark:bg-brand-400",
    gray: "bg-gray-500 dark:bg-zinc-400",
    success: "bg-emerald-500 dark:bg-emerald-400",
    warning: "bg-amber-500 dark:bg-amber-400",
    error: "bg-rose-500 dark:bg-rose-400",
    blue: "bg-blue-500 dark:bg-blue-400",
    purple: "bg-purple-500 dark:bg-purple-400",
    rose: "bg-rose-500 dark:bg-rose-400",
    amber: "bg-amber-500 dark:bg-amber-400",
  }[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center border shadow-xs select-none transition-colors",
        sizeClasses,
        variantClasses,
        className
      )}
      {...props}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full flex-none animate-pulse", dotColorClasses)} />}
      {leftIcon && <span className="flex-none">{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span className="flex-none">{rightIcon}</span>}
    </span>
  );
};
