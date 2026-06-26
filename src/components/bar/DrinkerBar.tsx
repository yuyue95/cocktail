"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Tabs from "@/components/ui/Tabs";
import Modal from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/Card";
import IngredientPicker, {
  type IngredientLite,
} from "@/components/bar/IngredientPicker";
import { CocktailRow } from "@/components/cocktail/CocktailCard";
import { getJSON, sendJSON } from "@/lib/fetcher";
import type { CocktailDTO } from "@/lib/dto";

type UserIngredient = {
  id: string;
  ingredientId: string;
  amountNote: string | null;
  ingredient: { id: string; name: string; nameEn: string | null };
};
type Recommendations = {
  exact: CocktailDTO[];
  missingOne: { cocktail: CocktailDTO; missing: { id: string; name: string }[] }[];
};
type ListItem = { id: string; listType: string; cocktail: CocktailDTO };

export default function DrinkerBar() {
  const [tab, setTab] = useState("materials");

  return (
    <div className="px-5 pt-6">
      <h1 className="text-center text-xl font-bold text-ink">我的吧台</h1>
      <div className="mt-4">
        <Tabs
          tabs={[
            { value: "materials", label: "材料" },
            { value: "list", label: "酒单" },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>
      <div className="mt-5">
        {tab === "materials" ? <MaterialsTab /> : <ListTab />}
      </div>
    </div>
  );
}

function MaterialsTab() {
  const [items, setItems] = useState<UserIngredient[]>([]);
  const [recs, setRecs] = useState<Recommendations | null>(null);
  const [picking, setPicking] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [mine, rec] = await Promise.all([
        getJSON<UserIngredient[]>("/api/user-ingredients"),
        getJSON<Recommendations>("/api/recommendations/by-ingredients"),
      ]);
      setItems(mine);
      setRecs(rec);
    } catch {
      toast.error("加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function add(ing: IngredientLite) {
    try {
      await sendJSON("/api/user-ingredients", "POST", { ingredientId: ing.id });
      setPicking(false);
      await load();
      toast.success(`已添加 ${ing.name}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "添加失败");
    }
  }

  async function remove(ingredientId: string) {
    try {
      await sendJSON(`/api/user-ingredients/${ingredientId}`, "DELETE");
      await load();
    } catch {
      toast.error("删除失败");
    }
  }

  if (loading) return <p className="py-8 text-center text-sm text-muted">加载中…</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-ink">我有的材料</h2>
        <button
          onClick={() => setPicking(true)}
          className="inline-flex items-center gap-1 text-sm text-accent"
        >
          <Plus className="h-4 w-4" /> 添加材料
        </button>
      </div>

      {items.length === 0 ? (
        <div className="mt-3">
          <EmptyState
            title="还没有添加材料"
            description="告诉吧台你手头有什么，我来告诉你能调出哪些酒。"
          />
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((it) => (
            <span
              key={it.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-ink"
            >
              {it.ingredient.name}
              <button
                onClick={() => remove(it.ingredientId)}
                className="text-muted hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {recs && items.length > 0 && (
        <div className="mt-7 space-y-6">
          <section>
            <h3 className="mb-1 font-semibold text-ink">
              🟢 现在就能做（{recs.exact.length}）
            </h3>
            {recs.exact.length === 0 ? (
              <p className="text-sm text-muted">还差一点，再加些材料试试。</p>
            ) : (
              <div>
                {recs.exact.map((c, i) => (
                  <CocktailRow key={c.id} cocktail={c} index={i} />
                ))}
              </div>
            )}
          </section>

          {recs.missingOne.length > 0 && (
            <section>
              <h3 className="mb-2 font-semibold text-ink">
                🟡 再备一种材料（{recs.missingOne.length}）
              </h3>
              <div className="space-y-2">
                {recs.missingOne.map(({ cocktail, missing }) => (
                  <Link
                    key={cocktail.id}
                    href={`/cocktails/${cocktail.slug}`}
                    className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
                  >
                    <span className="font-medium text-ink">{cocktail.name}</span>
                    <span className="text-xs text-muted">
                      缺：{missing.map((m) => m.name).join("、")}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <Modal open={picking} onClose={() => setPicking(false)} title="添加材料">
        <IngredientPicker
          onPick={add}
          excludeIds={items.map((i) => i.ingredientId)}
        />
      </Modal>
    </div>
  );
}

function ListTab() {
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJSON<ListItem[]>("/api/user-cocktail-list")
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="py-8 text-center text-sm text-muted">加载中…</p>;

  const favorites = items.filter((i) => i.listType === "favorite");
  const wantList = items.filter((i) => i.listType === "want_to_make");

  if (items.length === 0) {
    return (
      <EmptyState
        title="酒单还是空的"
        description="在配方详情页点「收藏」或「想做」，它们会出现在这里。"
      />
    );
  }

  return (
    <div className="space-y-6">
      {favorites.length > 0 && (
        <section>
          <h3 className="mb-1 font-semibold text-ink">我的收藏</h3>
          {favorites.map((it, i) => (
            <CocktailRow key={it.id} cocktail={it.cocktail} index={i} />
          ))}
        </section>
      )}
      {wantList.length > 0 && (
        <section>
          <h3 className="mb-1 font-semibold text-ink">想做清单</h3>
          {wantList.map((it, i) => (
            <CocktailRow key={it.id} cocktail={it.cocktail} index={i} />
          ))}
        </section>
      )}
    </div>
  );
}
