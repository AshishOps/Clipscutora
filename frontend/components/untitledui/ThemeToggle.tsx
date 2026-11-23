"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon01 } from "@untitledui/icons";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "relative w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 cursor-pointer outline-none select-none shadow-xs",
        "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900",
        "dark:border-zinc-800 dark:hover:border-zinc-700 dark:bg-zinc-900/60 dark:hover:bg-zinc-800 dark:text-zinc-300 dark:hover:text-zinc-100",
        "focus:ring-4 focus:ring-brand-500/15",
        className
      )}
    >
      {isDark ? (
        <Sun className="w-4 h-4 stroke-[2] transition-transform rotate-0 scale-100 text-amber-400" />
      ) : (
        <Moon01 className="w-4 h-4 stroke-[2] transition-transform rotate-0 scale-100 text-brand-600" />
      )}
    </button>
  );
}
