"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import CalendarMonth from "@/components/calendar/CalendarMonth";
import { EmptyState } from "@/components/ui/Card";
import { getJSON, sendJSON } from "@/lib/fetcher";
import { formatCNY } from "@/lib/utils";

type Sale = {
  id: string;
  quantity: number;
  unitPrice: number;
  cocktail: { name: string } | null;
};
type BusinessLog = {
  id: string;
  loggedDate: string;
  note: string | null;
  total: number;
  sales: Sale[];
};
type Report = {
  totalRevenue: number;
  totalCups: number;
  bestSellers: { name: string; cups: number; revenue: number }[];
};

export default function BartenderCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
  const [logs, setLogs] = useState<BusinessLog[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [logsData, reportData] = await Promise.all([
        getJSON<BusinessLog[]>(`/api/business-logs?year=${year}&month=${month}`),
        getJSON<Report>(`/api/reports/monthly?year=${year}&month=${month}`),
      ]);
      setLogs(logsData);
      setReport(reportData);
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
    for (const l of logs) set.add(new Date(l.loggedDate).getDate());
    return set;
  }, [logs]);

  const dayLogs = useMemo(
    () =>
      selectedDay
        ? logs.filter((l) => new Date(l.loggedDate).getDate() === selectedDay)
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
    if (!confirm("确定删除这天的营业记录？")) return;
    try {
      await sendJSON(`/api/business-logs/${id}`, "DELETE");
      await load();
      toast.success("已删除");
    } catch {
      toast.error("删除失败");
    }
  }

  return (
    <div className="px-5 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">营业日历</h1>
        <Link
          href="/calendar/business/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm text-cream"
        >
          <Plus className="h-4 w-4" /> 记录
        </Link>
      </div>

      {/* Monthly overview */}
      {report && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs text-muted">本月销售额</p>
            <p className="mt-1 font-bold text-ink">{formatCNY(report.totalRevenue)}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs text-muted">总杯数</p>
            <p className="mt-1 font-bold text-ink">{report.totalCups} 杯</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs text-muted">最畅销</p>
            <p className="mt-1 truncate font-bold text-ink">
              {report.bestSellers[0]?.name ?? "—"}
            </p>
          </div>
        </div>
      )}

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
          {selectedDay ? `${month} 月 ${selectedDay} 日营业记录` : "本月记录"}
        </h2>

        {loading ? (
          <p className="py-8 text-center text-sm text-muted">加载中…</p>
        ) : dayLogs.length === 0 ? (
          <EmptyState
            title="这天还没有营业记录"
            description="记录每天卖出的酒款与金额，月底自动汇总。"
          />
        ) : (
          <div className="space-y-3">
            {dayLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-2xl border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-1">
                    {log.sales.map((s) => (
                      <div
                        key={s.id}
                        className="flex justify-between text-sm text-ink"
                      >
                        <span>
                          {s.cocktail?.name ?? "其他"} × {s.quantity}
                        </span>
                        <span className="text-muted">
                          {formatCNY(s.quantity * s.unitPrice)}
                        </span>
                      </div>
                    ))}
                    <div className="mt-2 flex justify-between border-t border-border pt-2 font-semibold text-ink">
                      <span>合计</span>
                      <span>{formatCNY(log.total)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => remove(log.id)}
                    className="ml-2 rounded-full p-1.5 text-muted hover:bg-cream hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {log.note && (
                  <p className="mt-2 text-sm text-ink/70">{log.note}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
