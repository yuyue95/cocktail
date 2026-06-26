"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";
import Modal from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import IngredientPicker, {
  type IngredientLite,
} from "@/components/bar/IngredientPicker";
import { getJSON, sendJSON } from "@/lib/fetcher";
import { formatCNY, toDateKey } from "@/lib/utils";
import { INVENTORY_UNITS } from "@/lib/constants";

type Purchase = {
  id: string;
  quantity: number;
  unit: string;
  totalCost: number;
  purchasedAt: string;
  note: string | null;
  ingredient: { name: string };
};

// Restock history. Creating a purchase also increments inventory (server-side).
export default function PurchasesView() {
  const [records, setRecords] = useState<Purchase[]>([]);
  const [adding, setAdding] = useState(false);
  const [picked, setPicked] = useState<IngredientLite | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [unit, setUnit] = useState<string>(INVENTORY_UNITS[0]);
  const [totalCost, setTotalCost] = useState(0);
  const [purchasedAt, setPurchasedAt] = useState(toDateKey(new Date()));
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRecords(await getJSON<Purchase[]>("/api/purchases"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    if (!picked) return;
    try {
      await sendJSON("/api/purchases", "POST", {
        ingredientId: picked.id,
        quantity: Number(quantity),
        unit,
        totalCost: Number(totalCost),
        purchasedAt,
      });
      setAdding(false);
      setPicked(null);
      setQuantity(0);
      setTotalCost(0);
      await load();
      toast.success("已入库");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "保存失败");
    }
  }

  return (
    <div className="px-5 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-xl font-bold text-ink">进货记录</h1>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-1 text-sm text-accent"
        >
          <Plus className="h-4 w-4" /> 入库
        </button>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-muted">加载中…</p>
      ) : records.length === 0 ? (
        <div className="mt-5">
          <EmptyState title="还没有进货记录" description="登记每次采购，库存会自动累加。" />
        </div>
      ) : (
        <div className="mt-5 space-y-2">
          {records.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
            >
              <div>
                <p className="font-medium text-ink">{r.ingredient.name}</p>
                <p className="text-xs text-muted">
                  {new Date(r.purchasedAt).toLocaleDateString("zh-CN")} · {r.quantity}{" "}
                  {r.unit}
                </p>
              </div>
              <span className="text-sm font-medium text-ink">
                {formatCNY(r.totalCost)}
              </span>
            </div>
          ))}
        </div>
      )}

      <Modal open={adding} onClose={() => setAdding(false)} title="入库 / 进货">
        {!picked ? (
          <IngredientPicker onPick={setPicked} />
        ) : (
          <div className="space-y-4">
            <p className="font-medium text-ink">{picked.name}</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>数量</Label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>
              <div>
                <Label>单位</Label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-ink outline-none focus:border-accent"
                >
                  {INVENTORY_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>总价</Label>
                <Input
                  type="number"
                  value={totalCost}
                  onChange={(e) => setTotalCost(Number(e.target.value))}
                />
              </div>
              <div>
                <Label>日期</Label>
                <Input
                  type="date"
                  value={purchasedAt}
                  onChange={(e) => setPurchasedAt(e.target.value)}
                />
              </div>
            </div>
            <Button className="w-full" onClick={save}>
              确认入库
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
