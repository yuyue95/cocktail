"use client";

import { useState } from "react";
import { Shuffle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CocktailRow } from "@/components/cocktail/CocktailCard";
import { getJSON } from "@/lib/fetcher";
import { cn } from "@/lib/utils";
import type { CocktailDTO } from "@/lib/dto";

// Home page "配方推荐": horizontally scrollable category chips, a 3-item list,
// and "换一组 / 随机喝一杯" actions. Seeded server-side, refreshed client-side.
export default function RecommendSection({
  categories,
  initialCategory,
  initialCocktails,
}: {
  categories: string[];
  initialCategory: string;
  initialCocktails: CocktailDTO[];
}) {
  const router = useRouter();
  const [active, setActive] = useState(initialCategory);
  const [items, setItems] = useState<CocktailDTO[]>(initialCocktails);
  const [loading, setLoading] = useState(false);

  async function load(category: string) {
    setActive(category);
    setLoading(true);
    try {
      const data = await getJSON<CocktailDTO[]>(
        `/api/cocktails/random?category=${encodeURIComponent(category)}&count=3`
      );
      setItems(data);
    } catch {
      toast.error("加载失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  async function reroll() {
    await load(active);
  }

  async function randomOne() {
    try {
      const [pick] = await getJSON<CocktailDTO[]>(`/api/cocktails/random?count=1`);
      if (pick) router.push(`/cocktails/${pick.slug}`);
    } catch {
      toast.error("加载失败，请重试");
    }
  }

  return (
    <section className="px-5 pt-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-ink">配方推荐</h2>
      </div>

      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => load(c)}
            className={cn(
              "whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm transition",
              active === c
                ? "bg-ink text-cream"
                : "bg-card text-muted hover:text-ink"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className={cn("mt-2", loading && "opacity-50")}>
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">该分类暂无配方</p>
        ) : (
          items.map((c, i) => <CocktailRow key={c.id} cocktail={c} index={i} />)
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={reroll}
          className="inline-flex items-center gap-1.5 rounded-full bg-card px-4 py-2 text-sm text-ink transition hover:bg-accent-soft"
        >
          <RefreshCw className="h-4 w-4" /> 换一组
        </button>
        <button
          onClick={randomOne}
          className="inline-flex items-center gap-1.5 rounded-full bg-card px-4 py-2 text-sm text-ink transition hover:bg-accent-soft"
        >
          <Shuffle className="h-4 w-4" /> 随机喝一杯
        </button>
      </div>
    </section>
  );
}
