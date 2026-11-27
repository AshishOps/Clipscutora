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
      <div className="w-9 h-9 rounded-full border border-[#dae7ff] dark:border-[#2a2d33] bg-white dark:bg-[#141518]" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "relative w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer outline-none select-none shadow-xs",
        "border-[#dae7ff] hover:border-[#b5d2ff] bg-white hover:bg-[#eef4ff] text-[#4d5b85] hover:text-[#0c1836]",
        "dark:border-[#2a2d33] dark:hover:border-[#3b86ff]/50 dark:bg-[#141518] dark:hover:bg-[#1c1e22] dark:text-[#9da4b0] dark:hover:text-white",
        "focus:ring-4 focus:ring-[#3b86ff]/20",
        className
      )}
    >
      {isDark ? (
        <Sun className="w-4 h-4 stroke-[2] text-amber-400" />
      ) : (
        <Moon01 className="w-4 h-4 stroke-[2] text-[#3b86ff]" />
      )}
    </button>
  );
}
