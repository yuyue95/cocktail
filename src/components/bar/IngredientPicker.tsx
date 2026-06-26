"use client";

import { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import { getJSON } from "@/lib/fetcher";
import { ingredientTypeLabel } from "@/lib/constants";

export type IngredientLite = {
  id: string;
  name: string;
  nameEn: string | null;
  type: string;
};

// Searchable ingredient list. Calls `onPick` with the chosen ingredient.
// `excludeIds` hides ingredients already added by the caller.
export default function IngredientPicker({
  onPick,
  excludeIds = [],
}: {
  onPick: (ingredient: IngredientLite) => void;
  excludeIds?: string[];
}) {
  const [all, setAll] = useState<IngredientLite[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    getJSON<IngredientLite[]>("/api/ingredients")
      .then(setAll)
      .catch(() => setAll([]));
  }, []);

  const filtered = useMemo(() => {
    const exclude = new Set(excludeIds);
    return all
      .filter((i) => !exclude.has(i.id))
      .filter((i) =>
        query.trim()
          ? i.name.includes(query) ||
            (i.nameEn ?? "").toLowerCase().includes(query.toLowerCase())
          : true
      );
  }, [all, query, excludeIds]);

  return (
    <div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索材料…"
          className="h-11 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm text-ink outline-none focus:border-accent"
        />
      </div>

      <div className="mt-3 max-h-72 space-y-1 overflow-y-auto">
        {filtered.map((ing) => (
          <button
            key={ing.id}
            onClick={() => onPick(ing)}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition hover:bg-cream"
          >
            <span className="text-ink">
              {ing.name}
              {ing.nameEn && (
                <span className="ml-2 text-xs text-muted">{ing.nameEn}</span>
              )}
            </span>
            <span className="text-xs text-muted">
              {ingredientTypeLabel(ing.type)}
            </span>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="py-6 text-center text-sm text-muted">没有更多材料</p>
        )}
      </div>
    </div>
  );
}
