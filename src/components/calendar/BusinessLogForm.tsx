"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Input, Textarea, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { getJSON, sendJSON } from "@/lib/fetcher";
import { toDateKey } from "@/lib/utils";
import type { CocktailDTO } from "@/lib/dto";

type SaleRow = { cocktailId: string; quantity: number; unitPrice: number };

// Record a day's sales: a date, an optional note, and one row per drink sold.
// Prices default from the bartender's saved menu when available.
export default function BusinessLogForm() {
  const router = useRouter();
  const [cocktails, setCocktails] = useState<CocktailDTO[]>([]);
  const [menuPrices, setMenuPrices] = useState<Record<string, number>>({});
  const [loggedDate, setLoggedDate] = useState(toDateKey(new Date()));
  const [note, setNote] = useState("");
  const [rows, setRows] = useState<SaleRow[]>([
    { cocktailId: "", quantity: 1, unitPrice: 0 },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getJSON<CocktailDTO[]>("/api/cocktails?limit=50")
      .then(setCocktails)
      .catch(() => setCocktails([]));
    // Pull saved menu to prefill prices.
    getJSON<{ cocktailId: string; price: number }[]>("/api/bar-menu")
      .then((items) => {
        const map: Record<string, number> = {};
        for (const i of items) map[i.cocktailId] = i.price;
        setMenuPrices(map);
      })
      .catch(() => {});
  }, []);

  function updateRow(idx: number, patch: Partial<SaleRow>) {
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== idx) return r;
        const next = { ...r, ...patch };
        // When picking a cocktail, prefill the price from the menu.
        if (patch.cocktailId && menuPrices[patch.cocktailId] !== undefined) {
          next.unitPrice = menuPrices[patch.cocktailId];
        }
        return next;
      })
    );
  }

  function addRow() {
    setRows((prev) => [...prev, { cocktailId: "", quantity: 1, unitPrice: 0 }]);
  }
  function removeRow(idx: number) {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  }

  const total = rows.reduce((s, r) => s + r.quantity * r.unitPrice, 0);

  async function submit() {
    const sales = rows
      .filter((r) => r.quantity > 0)
      .map((r) => ({
        cocktailId: r.cocktailId || null,
        quantity: Number(r.quantity),
        unitPrice: Number(r.unitPrice),
      }));
    if (sales.length === 0) {
      toast.error("请至少添加一条销售记录");
      return;
    }
    setSaving(true);
    try {
      await sendJSON("/api/business-logs", "POST", {
        loggedDate,
        note: note.trim() || null,
        sales,
      });
      toast.success("已记录");
      router.push("/calendar");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-5 pt-6">
      <div className="flex items-center gap-3">
        <Link
          href="/calendar"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-bold text-ink">记录营业</h1>
      </div>

      <div className="mt-6 space-y-5">
        <div>
          <Label>日期</Label>
          <Input
            type="date"
            value={loggedDate}
            onChange={(e) => setLoggedDate(e.target.value)}
          />
        </div>

        <div>
          <Label>销售明细</Label>
          <div className="space-y-2">
            {rows.map((row, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <select
                  value={row.cocktailId}
                  onChange={(e) => updateRow(idx, { cocktailId: e.target.value })}
                  className="h-10 flex-1 rounded-xl border border-border bg-card px-2 text-sm text-ink outline-none focus:border-accent"
                >
                  <option value="">其他</option>
                  {cocktails.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  value={row.quantity}
                  onChange={(e) =>
                    updateRow(idx, { quantity: Number(e.target.value) })
                  }
                  className="h-10 w-14 rounded-xl border border-border bg-card px-2 text-center text-sm text-ink outline-none focus:border-accent"
                  aria-label="数量"
                />
                <input
                  type="number"
                  min={0}
                  value={row.unitPrice}
                  onChange={(e) =>
                    updateRow(idx, { unitPrice: Number(e.target.value) })
                  }
                  className="h-10 w-20 rounded-xl border border-border bg-card px-2 text-center text-sm text-ink outline-none focus:border-accent"
                  aria-label="单价"
                  placeholder="单价"
                />
                <button
                  onClick={() => removeRow(idx)}
                  className="rounded-full p-1.5 text-muted hover:text-red-600"
                  aria-label="删除"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addRow}
            className="mt-2 inline-flex items-center gap-1 text-sm text-accent"
          >
            <Plus className="h-4 w-4" /> 添加一行
          </button>
        </div>

        <div className="flex justify-between rounded-xl bg-accent-soft px-4 py-3 font-semibold text-ink">
          <span>合计</span>
          <span>¥{total.toLocaleString("zh-CN")}</span>
        </div>

        <div>
          <Label>备注</Label>
          <Textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="今天有什么特别的？"
          />
        </div>

        <Button size="lg" className="w-full" onClick={submit} disabled={saving}>
          {saving ? "保存中…" : "保存营业记录"}
        </Button>
      </div>
    </div>
  );
}
