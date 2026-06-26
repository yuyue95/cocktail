"use client";

import { cn } from "@/lib/utils";

// Simple controlled segmented tabs used by the bar (and other) views.
export default function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { value: string; label: string }[];
  active: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex border-b border-border">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={cn(
            "flex-1 border-b-2 px-4 py-3 text-sm font-medium transition",
            active === t.value
              ? "border-ink text-ink"
              : "border-transparent text-muted hover:text-ink"
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
