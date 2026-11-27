"use client";

import React from "react";
import { cn } from "@/lib/utils";

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        "bg-white dark:bg-[#141518] border border-[#dae7ff] dark:border-[#2a2d33] rounded-2xl shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_24px_48px_-32px_rgba(0,0,0,0.75)] transition-all duration-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn("p-6 sm:p-7 border-b border-[#eef4ff] dark:border-[#2a2d33] flex flex-col gap-1.5", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <h3
      className={cn("text-base sm:text-lg font-semibold text-[#0c1836] dark:text-[#f1f4f9] tracking-tight", className)}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <p className={cn("text-xs sm:text-sm text-[#4d5b85] dark:text-[#9da4b0] font-normal", className)} {...props}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn("p-6 sm:p-8 space-y-8", className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        "p-5 sm:p-6 bg-[#eef4ff]/60 dark:bg-[#0b0c0e]/60 border-t border-[#dae7ff] dark:border-[#2a2d33] rounded-b-2xl flex items-center justify-between",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
