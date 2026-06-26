"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import CalendarMonth from "@/components/calendar/CalendarMonth";
import StarRating from "@/components/ui/StarRating";
import { EmptyState } from "@/components/ui/Card";
import { getJSON, sendJSON } from "@/lib/fetcher";

type DrinkLog = {
  id: string;
  cocktailId: string | null;
  customName: string | null;
  loggedAt: string;
  rating: number;
  flavorTags: string[];
  note: string | null;
  isHomemade: boolean;
  cocktail: { name: string; slug: string } | null;
};

export default function DrinkerCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
  const [logs, setLogs] = useState<DrinkLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getJSON<DrinkLog[]>(
        `/api/drink-logs?year=${year}&month=${month}`
      );
      setLogs(data);
    } catch {
      toast.error("加载失败");
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    load();
  }, [load]);

  const marks = useMemo(() => {
    const set = new Set<number>();
    for (const l of logs) set.add(new Date(l.loggedAt).getDate());
    return set;
  }, [logs]);

  const dayLogs = useMemo(
    () =>
      selectedDay
        ? logs.filter((l) => new Date(l.loggedAt).getDate() === selectedDay)
        : [],
    [logs, selectedDay]
  );

  function prevMonth() {
    setSelectedDay(null);
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else setMonth((m) => m - 1);
  }
  function nextMonth() {
    setSelectedDay(null);
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else setMonth((m) => m + 1);
  }

  async function remove(id: string) {
    if (!confirm("确定删除这条记录？")) return;
    try {
      await sendJSON(`/api/drink-logs/${id}`, "DELETE");
      setLogs((prev) => prev.filter((l) => l.id !== id));
      toast.success("已删除");
    } catch {
      toast.error("删除失败");
    }
  }

  return (
    <div className="px-5 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">调酒日历</h1>
        <Link
          href="/calendar/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm text-cream"
        >
          <Plus className="h-4 w-4" /> 记录
        </Link>
      </div>

      <div className="mt-4">
        <CalendarMonth
          year={year}
          month={month}
          marks={marks}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          onPrev={prevMonth}
          onNext={nextMonth}
        />
      </div>

      <div className="mt-5">
        <h2 className="mb-3 font-semibold text-ink">
          {selectedDay ? `${month} 月 ${selectedDay} 日` : "本月记录"}
        </h2>

        {loading ? (
          <p className="py-8 text-center text-sm text-muted">加载中…</p>
        ) : dayLogs.length === 0 ? (
          <EmptyState
            title="还没有喝酒记录"
            description="从第一杯开始记录你的品饮日历。"
            action={
              <Link
                href="/calendar/new"
                className="rounded-full bg-ink px-4 py-2 text-sm text-cream"
              >
                记一杯
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {dayLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-2xl border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-ink">
                      🍸 {log.cocktail?.name ?? log.customName ?? "未命名"}
                    </p>
                    {log.rating > 0 && (
                      <div className="mt-1">
                        <StarRating value={log.rating} readOnly size="sm" />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Link
                      href={`/calendar/${log.id}/edit`}
                      className="rounded-full p-1.5 text-muted hover:bg-cream hover:text-ink"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => remove(log.id)}
                      className="rounded-full p-1.5 text-muted hover:bg-cream hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {log.flavorTags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {log.flavorTags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {log.note && (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-ink/80">
                    {log.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
