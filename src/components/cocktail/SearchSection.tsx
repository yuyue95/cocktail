"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, BookOpen } from "lucide-react";
import Link from "next/link";
import CocktailCard from "@/components/cocktail/CocktailCard";
import { getJSON } from "@/lib/fetcher";
import { BASE_SPIRIT_FILTERS } from "@/lib/constants";
import type { CocktailDTO } from "@/lib/dto";

type SearchResult = {
  cocktails: CocktailDTO[];
  articles: { id: string; title: string; slug: string; category: string | null }[];
};

// Home page search area (replaces the standalone 探索 page). Debounced live
// search over cocktails + articles, with base-spirit quick filters.
export default function SearchSection() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runSearch = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setResult(null);
      return;
    }
    setLoading(true);
    try {
      const data = await getJSON<SearchResult>(
        `/api/search?q=${encodeURIComponent(trimmed)}`
      );
      setResult(data);
    } catch {
      setResult({ cocktails: [], articles: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce keystrokes.
  useEffect(() => {
    const t = setTimeout(() => runSearch(query), 300);
    return () => clearTimeout(t);
  }, [query, runSearch]);

  return (
    <section className="px-5 pt-8">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-ink">搜索配方</h2>
        <Link
          href="/knowledge"
          className="inline-flex items-center gap-1 text-sm text-muted transition hover:text-ink"
        >
          <BookOpen className="h-4 w-4" /> 知识库
        </Link>
      </div>

      <div className="relative mt-3">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索鸡尾酒 / 中英文名 / 材料…"
          className="h-12 w-full rounded-full border border-border bg-card pl-10 pr-4 text-sm text-ink outline-none focus:border-accent"
        />
      </div>

      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
        {BASE_SPIRIT_FILTERS.map((spirit) => (
          <button
            key={spirit}
            onClick={() => setQuery(spirit)}
            className="whitespace-nowrap rounded-full bg-card px-3.5 py-1.5 text-sm text-muted transition hover:text-ink"
          >
            {spirit}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {loading && <p className="py-6 text-center text-sm text-muted">搜索中…</p>}

        {!loading && result && result.cocktails.length === 0 && result.articles.length === 0 && (
          <p className="py-6 text-center text-sm text-muted">
            没找到「{query}」，换个关键词试试
          </p>
        )}

        {!loading && result && result.cocktails.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {result.cocktails.map((c) => (
              <CocktailCard key={c.id} cocktail={c} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
