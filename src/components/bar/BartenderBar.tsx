"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, AlertTriangle, PackagePlus } from "lucide-react";
import { toast } from "sonner";
import Tabs from "@/components/ui/Tabs";
import Modal from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import IngredientPicker, {
  type IngredientLite,
} from "@/components/bar/IngredientPicker";
import { getJSON, sendJSON } from "@/lib/fetcher";
import { formatCNY } from "@/lib/utils";
import { INVENTORY_UNITS } from "@/lib/constants";
import type { CocktailDTO } from "@/lib/dto";

export default function BartenderBar() {
  const [tab, setTab] = useState("menu");
  return (
    <div className="px-5 pt-6">
      <h1 className="text-center text-xl font-bold text-ink">我的吧台</h1>
      <div className="mt-4">
        <Tabs
          tabs={[
            { value: "menu", label: "酒单" },
            { value: "inventory", label: "库存材料" },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>
      <div className="mt-5">{tab === "menu" ? <MenuTab /> : <InventoryTab />}</div>
    </div>
  );
}

type MenuItem = {
  id: string;
  cocktailId: string;
  price: number;
  cost: number;
  profit: number;
  isActive: boolean;
  cocktail: { name: string };
};

function MenuTab() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [cocktails, setCocktails] = useState<CocktailDTO[]>([]);
  const [adding, setAdding] = useState(false);
  const [cocktailId, setCocktailId] = useState("");
  const [price, setPrice] = useState(0);
  const [cost, setCost] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [menu, cs] = await Promise.all([
        getJSON<MenuItem[]>("/api/bar-menu"),
        getJSON<CocktailDTO[]>("/api/cocktails?limit=50"),
      ]);
      setItems(menu);
      setCocktails(cs);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    if (!cocktailId) {
      toast.error("请选择一款酒");
      return;
    }
    try {
      await sendJSON("/api/bar-menu", "POST", {
        cocktailId,
        price: Number(price),
        cost: Number(cost),
        isActive: true,
      });
      setAdding(false);
      setCocktailId("");
      setPrice(0);
      setCost(0);
      await load();
      toast.success("已保存");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "保存失败");
    }
  }

  async function remove(id: string) {
    try {
      await sendJSON(`/api/bar-menu/${id}`, "DELETE");
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      toast.error("删除失败");
    }
  }

  if (loading) return <p className="py-8 text-center text-sm text-muted">加载中…</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-ink">酒单与定价</h2>
        <button
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-1 text-sm text-accent"
        >
          <Plus className="h-4 w-4" /> 新建
        </button>
      </div>

      {items.length === 0 ? (
        <div className="mt-3">
          <EmptyState title="还没有酒单" description="把你在卖的酒加进来并设定价格。" />
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {items.map((it) => (
            <div
              key={it.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
            >
              <div>
                <p className="font-medium text-ink">{it.cocktail.name}</p>
                <p className="text-xs text-muted">
                  定价 {formatCNY(it.price)} · 成本 {formatCNY(it.cost)} · 利润{" "}
                  <span className="text-accent">{formatCNY(it.profit)}</span>
                </p>
              </div>
              <button
                onClick={() => remove(it.id)}
                className="rounded-full p-1.5 text-muted hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={adding} onClose={() => setAdding(false)} title="新建酒单">
        <div className="space-y-4">
          <div>
            <Label>选择配方</Label>
            <select
              value={cocktailId}
              onChange={(e) => setCocktailId(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-ink outline-none focus:border-accent"
            >
              <option value="">请选择</option>
              {cocktails.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>售价</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>成本</Label>
              <Input
                type="number"
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
              />
            </div>
          </div>
          <Button className="w-full" onClick={save}>
            保存
          </Button>
        </div>
      </Modal>
    </div>
  );
}

type InventoryItem = {
  id: string;
  ingredientId: string;
  quantity: number;
  unit: string;
  lowStockThreshold: number;
  unitCost: number;
  isLow: boolean;
  ingredient: { name: string };
};

function InventoryTab() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [adding, setAdding] = useState(false);
  const [picked, setPicked] = useState<IngredientLite | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [unit, setUnit] = useState<string>(INVENTORY_UNITS[0]);
  const [threshold, setThreshold] = useState(0);
  const [unitCost, setUnitCost] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await getJSON<InventoryItem[]>("/api/inventory"));
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
      await sendJSON("/api/inventory", "POST", {
        ingredientId: picked.id,
        quantity: Number(quantity),
        unit,
        lowStockThreshold: Number(threshold),
        unitCost: Number(unitCost),
      });
      setAdding(false);
      setPicked(null);
      setQuantity(0);
      setThreshold(0);
      setUnitCost(0);
      await load();
      toast.success("库存已更新");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "保存失败");
    }
  }

  async function remove(id: string) {
    try {
      await sendJSON(`/api/inventory/${id}`, "DELETE");
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      toast.error("删除失败");
    }
  }

  if (loading) return <p className="py-8 text-center text-sm text-muted">加载中…</p>;

  const lowCount = items.filter((i) => i.isLow).length;

  return (
    <div>
      {lowCount > 0 && (
        <div className="mb-3 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4" /> 有 {lowCount} 种材料库存不足
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-ink">库存材料</h2>
        <button
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-1 text-sm text-accent"
        >
          <PackagePlus className="h-4 w-4" /> 添加 / 入库
        </button>
      </div>

      {items.length === 0 ? (
        <div className="mt-3">
          <EmptyState title="还没有库存记录" description="登记材料的数量，低于阈值会提醒补货。" />
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {items.map((it) => (
            <div
              key={it.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
            >
              <div>
                <p className="font-medium text-ink">
                  {it.isLow && "⚠️ "}
                  {it.ingredient.name}
                </p>
                <p className="text-xs text-muted">
                  剩余 {it.quantity} {it.unit}
                  {it.lowStockThreshold > 0 && ` · 预警 ≤ ${it.lowStockThreshold}`}
                </p>
              </div>
              <button
                onClick={() => remove(it.id)}
                className="rounded-full p-1.5 text-muted hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={adding} onClose={() => setAdding(false)} title="添加 / 更新库存">
        {!picked ? (
          <IngredientPicker
            onPick={setPicked}
            excludeIds={items.map((i) => i.ingredientId)}
          />
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
                <Label>预警阈值</Label>
                <Input
                  type="number"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                />
              </div>
              <div>
                <Label>进价/单位</Label>
                <Input
                  type="number"
                  value={unitCost}
                  onChange={(e) => setUnitCost(Number(e.target.value))}
                />
              </div>
            </div>
            <Button className="w-full" onClick={save}>
              保存
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
