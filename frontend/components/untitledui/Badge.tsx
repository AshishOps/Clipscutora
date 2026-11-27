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
    sm: "px-2.5 py-0.5 text-[11px] gap-1.5 font-semibold rounded-full",
    md: "px-3 py-0.5 text-xs gap-1.5 font-semibold rounded-full",
    lg: "px-3.5 py-1 text-xs gap-2 font-semibold rounded-full",
  }[size];

  const variantClasses = {
    brand: "bg-[#eef4ff] text-[#2563eb] border-[#d6e6ff] dark:bg-[#111e3e]/70 dark:text-[#85b5ff] dark:border-[#3b86ff]/30",
    gray: "bg-[#eef4ff] text-[#4d5b85] border-[#dae7ff] dark:bg-[#1c1e22] dark:text-[#9da4b0] dark:border-[#2a2d33]",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/40",
    warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700/40",
    error: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700/40",
    blue: "bg-[#eef4ff] text-[#2563eb] border-[#d6e6ff] dark:bg-[#111e3e]/70 dark:text-[#85b5ff] dark:border-[#3b86ff]/30",
    purple: "bg-[#eef4ff] text-[#2563eb] border-[#d6e6ff] dark:bg-[#1c1e22] dark:text-[#85b5ff] dark:border-[#2a2d33]",
    rose: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700/40",
    amber: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700/40",
  }[variant];

  const dotColorClasses = {
    brand: "bg-[#3b86ff]",
    gray: "bg-[#6a748a] dark:bg-[#9da4b0]",
    success: "bg-emerald-500 dark:bg-emerald-400",
    warning: "bg-amber-500 dark:bg-amber-400",
    error: "bg-rose-500 dark:bg-rose-400",
    blue: "bg-[#3b86ff]",
    purple: "bg-[#3b86ff]",
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
