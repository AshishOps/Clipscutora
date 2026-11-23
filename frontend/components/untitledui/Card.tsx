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
        "bg-white dark:bg-zinc-900/70 border border-gray-200 dark:border-zinc-800/80 rounded-2xl shadow-xs dark:shadow-lg backdrop-blur-md transition-all duration-200",
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
      className={cn("p-6 sm:p-7 border-b border-gray-100 dark:border-zinc-800/70 flex flex-col gap-1.5", className)}
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
      className={cn("text-base sm:text-lg font-semibold text-gray-900 dark:text-zinc-100 tracking-tight", className)}
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
    <p className={cn("text-xs sm:text-sm text-gray-500 dark:text-zinc-400 font-normal", className)} {...props}>
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
        "p-5 sm:p-6 bg-gray-50/50 dark:bg-zinc-950/40 border-t border-gray-100 dark:border-zinc-800/70 rounded-b-2xl flex items-center justify-between",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
