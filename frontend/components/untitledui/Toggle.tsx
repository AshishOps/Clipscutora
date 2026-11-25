"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  subtext?: string;
  disabled?: boolean;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  subtext,
  disabled = false,
  className,
}) => {
  return (
    <label
      className={cn(
        "inline-flex items-start gap-3 select-none cursor-pointer",
        disabled && "opacity-55 cursor-not-allowed",
        className
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          "mt-0.5 relative inline-flex h-6 w-10 flex-shrink-0 cursor-pointer border transition-colors duration-150",
          checked
            ? "bg-[var(--color-accent)] border-[var(--color-accent)]"
            : "bg-[var(--color-paper)] border-[var(--color-rule-2)]"
        )}
      >
        <span
          className={cn(
            "pointer-events-none block h-4 w-4 transition-transform duration-150 mt-[3px]",
            checked
              ? "translate-x-5 bg-[var(--color-accent-ink)]"
              : "translate-x-[3px] bg-[var(--color-muted)]"
          )}
        />
      </button>
      {(label || subtext) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-sm font-medium text-[var(--color-ink)]">
              {label}
            </span>
          )}
          {subtext && (
            <span className="text-xs text-[var(--color-muted)]">
              {subtext}
            </span>
          )}
        </div>
      )}
    </label>
  );
};
