"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

// Month grid. `marks` maps a day-of-month -> true when there is an entry, so
// both drinker and bartender modes can highlight active days. `selectedDay`
// is the currently focused day.
export default function CalendarMonth({
  year,
  month, // 1-12
  marks,
  selectedDay,
  onSelectDay,
  onPrev,
  onNext,
}: {
  year: number;
  month: number;
  marks: Set<number>;
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <button onClick={onPrev} className="rounded-full p-1.5 hover:bg-cream">
          <ChevronLeft className="h-5 w-5 text-ink" />
        </button>
        <span className="font-semibold text-ink">
          {year} 年 {month} 月
        </span>
        <button onClick={onNext} className="rounded-full p-1.5 hover:bg-cream">
          <ChevronRight className="h-5 w-5 text-ink" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-muted">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e${i}`} />;
          const marked = marks.has(day);
          const selected = selectedDay === day;
          return (
            <button
              key={day}
              onClick={() => onSelectDay(day)}
              className={cn(
                "relative flex aspect-square items-center justify-center rounded-lg text-sm transition",
                selected ? "bg-ink text-cream" : "text-ink hover:bg-cream"
              )}
            >
              {day}
              {marked && !selected && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-accent" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
