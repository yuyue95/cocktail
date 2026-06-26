"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import StarRating from "@/components/ui/StarRating";
import { Input, Textarea, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { getJSON, sendJSON } from "@/lib/fetcher";
import { FLAVOR_TAGS } from "@/lib/constants";
import { cn, toDateKey } from "@/lib/utils";
import type { CocktailDTO } from "@/lib/dto";

export type DrinkLogInitial = {
  id?: string;
  cocktailId?: string | null;
  customName?: string | null;
  loggedAt?: string;
  rating?: number;
  flavorTags?: string[];
  note?: string | null;
  isHomemade?: boolean;
};

// Create/edit a tasting note. When `initial.id` is present it edits via PUT.
export default function DrinkLogForm({
  initial,
  presetCocktailId,
}: {
  initial?: DrinkLogInitial;
  presetCocktailId?: string;
}) {
  const router = useRouter();
  const isEdit = !!initial?.id;

  const [cocktails, setCocktails] = useState<CocktailDTO[]>([]);
  const [cocktailId, setCocktailId] = useState(
    initial?.cocktailId ?? presetCocktailId ?? ""
  );
  const [customName, setCustomName] = useState(initial?.customName ?? "");
  const [loggedAt, setLoggedAt] = useState(
    initial?.loggedAt ? toDateKey(new Date(initial.loggedAt)) : toDateKey(new Date())
  );
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [tags, setTags] = useState<string[]>(initial?.flavorTags ?? []);
  const [note, setNote] = useState(initial?.note ?? "");
  const [isHomemade, setIsHomemade] = useState(initial?.isHomemade ?? true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getJSON<CocktailDTO[]>("/api/cocktails?limit=50")
      .then(setCocktails)
      .catch(() => setCocktails([]));
  }, []);

  function toggleTag(tag: string) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function submit() {
    if (!cocktailId && !customName.trim()) {
      toast.error("请选择配方或填写自创酒名");
      return;
    }
    setSaving(true);
    const payload = {
      cocktailId: cocktailId || null,
      customName: customName.trim() || null,
      loggedAt,
      rating,
      flavorTags: tags,
      note: note.trim() || null,
      isHomemade,
    };
    try {
      if (isEdit) {
        await sendJSON(`/api/drink-logs/${initial!.id}`, "PUT", payload);
      } else {
        await sendJSON("/api/drink-logs", "POST", payload);
      }
      toast.success(isEdit ? "已更新" : "记录成功");
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
        <h1 className="text-xl font-bold text-ink">
          {isEdit ? "编辑记录" : "随手记一杯"}
        </h1>
      </div>

      <div className="mt-6 space-y-5">
        <div>
          <Label>日期</Label>
          <Input
            type="date"
            value={loggedAt}
            onChange={(e) => setLoggedAt(e.target.value)}
          />
        </div>

        <div>
          <Label>选择配方</Label>
          <select
            value={cocktailId}
            onChange={(e) => setCocktailId(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-ink outline-none focus:border-accent"
          >
            <option value="">不选 / 自创</option>
            {cocktails.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {!cocktailId && (
          <div>
            <Label>自创酒名</Label>
            <Input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="给你的创作起个名字"
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <Label>是自己调的吗</Label>
          <button
            type="button"
            onClick={() => setIsHomemade((v) => !v)}
            className={cn(
              "h-7 w-12 rounded-full p-0.5 transition",
              isHomemade ? "bg-accent" : "bg-border"
            )}
          >
            <span
              className={cn(
                "block h-6 w-6 rounded-full bg-white transition",
                isHomemade && "translate-x-5"
              )}
            />
          </button>
        </div>

        <div>
          <Label>口感评分</Label>
          <StarRating value={rating} onChange={setRating} />
        </div>

        <div>
          <Label>口感标签</Label>
          <div className="flex flex-wrap gap-2">
            {FLAVOR_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition",
                  tags.includes(tag)
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border bg-card text-muted"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>调酒思考</Label>
          <Textarea
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="这次调酒有什么发现？下次想怎么改进？"
          />
        </div>

        <Button size="lg" className="w-full" onClick={submit} disabled={saving}>
          {saving ? "保存中…" : isEdit ? "保存修改" : "记录这一杯"}
        </Button>
      </div>
    </div>
  );
}
