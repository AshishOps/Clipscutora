"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon01 } from "@untitledui/icons";

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme");
    const isLight = saved === "light" || document.documentElement.dataset.mode === "light";
    setTheme(isLight ? "light" : "dark");
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.dataset.mode = next;
    if (next === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  };

  if (!mounted) {
    return (
      <div
        className="w-10 h-10 border border-[var(--color-rule)] bg-[var(--color-paper-2)]"
        aria-hidden="true"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="w-10 h-10 inline-flex items-center justify-center border border-[var(--color-rule-2)] bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-paper-2)] transition-colors duration-150 cursor-pointer"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 stroke-[1.75]" />
      ) : (
        <Moon01 className="w-4 h-4 stroke-[1.75]" />
      )}
    </button>
  );
};
