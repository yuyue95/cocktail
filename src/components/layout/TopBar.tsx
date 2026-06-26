"use client";

import Link from "next/link";
import { Martini } from "lucide-react";
import ThemeToggle from "@/components/layout/ThemeToggle";

// Greeting changes with the time of day, echoing the friendly tone of a
// personal notebook.
function greeting() {
  const h = new Date().getHours();
  if (h < 6) return "夜深了";
  if (h < 11) return "早上好";
  if (h < 14) return "中午好";
  if (h < 18) return "下午好";
  return "晚上好";
}

export default function TopBar({ title = "调酒笔记" }: { title?: string }) {
  return (
    <header className="flex items-center justify-between px-5 pt-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <Martini className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs text-muted">{greeting()}</p>
          <Link href="/" className="text-lg font-bold text-ink">
            {title}
          </Link>
        </div>
      </div>
      <ThemeToggle />
    </header>
  );
}
