"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

// Lightweight theme toggle that persists choice in localStorage and toggles
// the `dark` class on <html>. No extra dependency needed.
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored ? stored === "dark" : prefersDark;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="切换主题"
      className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-ink transition hover:bg-cream"
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
