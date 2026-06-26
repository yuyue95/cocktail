"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Input, Textarea, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { getJSON, sendJSON } from "@/lib/fetcher";
import { COCKTAIL_CATEGORIES, DIFFICULTIES } from "@/lib/constants";

type IngredientLite = { id: string; name: string };
type RecipeRow = { ingredientId: string; amount: string; isOptional: boolean };

export type CocktailFormInitial = {
  id?: string;
  name: string;
  nameEn: string;
  slug: string;
  category: string;
  flavorTags: string[];
  glassType: string;
  garnish: string;
  description: string;
  instructions: string[];
  imageUrl: string;
  difficulty: string;
  isPublished: boolean;
  ingredients: RecipeRow[];
};

const EMPTY: CocktailFormInitial = {
  name: "",
  nameEn: "",
  slug: "",
  category: COCKTAIL_CATEGORIES[0],
  flavorTags: [],
  glassType: "",
  garnish: "",
  description: "",
  instructions: [""],
  imageUrl: "",
  difficulty: "easy",
  isPublished: false,
  ingredients: [{ ingredientId: "", amount: "", isOptional: false }],
};

export default function CocktailForm({
  initial,
}: {
  initial?: CocktailFormInitial;
}) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [form, setForm] = useState<CocktailFormInitial>(initial ?? EMPTY);
  const [allIngredients, setAllIngredients] = useState<IngredientLite[]>([]);
  const [flavorInput, setFlavorInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getJSON<IngredientLite[]>("/api/ingredients")
      .then(setAllIngredients)
      .catch(() => setAllIngredients([]));
  }, []);

  function set<K extends keyof CocktailFormInitial>(
    key: K,
    value: CocktailFormInitial[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // Recipe rows
  function setRow(i: number, patch: Partial<RecipeRow>) {
    set(
      "ingredients",
      form.ingredients.map((r, idx) => (idx === i ? { ...r, ...patch } : r))
    );
  }
  function addRow() {
    set("ingredients", [
      ...form.ingredients,
      { ingredientId: "", amount: "", isOptional: false },
    ]);
  }
  function removeRow(i: number) {
    set(
      "ingredients",
      form.ingredients.filter((_, idx) => idx !== i)
    );
  }

  // Instruction steps
  function setStep(i: number, value: string) {
    set(
      "instructions",
      form.instructions.map((s, idx) => (idx === i ? value : s))
    );
  }
  function addStep() {
    set("instructions", [...form.instructions, ""]);
  }
  function removeStep(i: number) {
    set(
      "instructions",
      form.instructions.filter((_, idx) => idx !== i)
    );
  }

  function addFlavor() {
    const tag = flavorInput.trim();
    if (tag && !form.flavorTags.includes(tag)) {
      set("flavorTags", [...form.flavorTags, tag]);
    }
    setFlavorInput("");
  }

  async function submit() {
    const payload = {
      ...form,
      instructions: form.instructions.map((s) => s.trim()).filter(Boolean),
      ingredients: form.ingredients.filter((r) => r.ingredientId),
    };
    if (!payload.name || !payload.slug) {
      toast.error("名称和 slug 必填");
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await sendJSON(`/api/admin/cocktails/${initial!.id}`, "PUT", payload);
      } else {
        await sendJSON("/api/admin/cocktails", "POST", payload);
      }
      toast.success("已保存");
      router.push("/admin/cocktails");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <Link
          href="/admin/cocktails"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-bold text-ink">
          {isEdit ? "编辑酒谱" : "新建酒谱"}
        </h1>
      </div>

      <div className="mt-6 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>中文名</Label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div>
            <Label>英文名</Label>
            <Input value={form.nameEn} onChange={(e) => set("nameEn", e.target.value)} />
          </div>
          <div>
            <Label>Slug</Label>
            <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} />
          </div>
          <div>
            <Label>分类</Label>
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-ink"
            >
              {COCKTAIL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>难度</Label>
            <select
              value={form.difficulty}
              onChange={(e) => set("difficulty", e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-ink"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>图片 URL</Label>
            <Input
              value={form.imageUrl}
              onChange={(e) => set("imageUrl", e.target.value)}
            />
          </div>
          <div>
            <Label>杯型</Label>
            <Input
              value={form.glassType}
              onChange={(e) => set("glassType", e.target.value)}
            />
          </div>
          <div>
            <Label>装饰物</Label>
            <Input value={form.garnish} onChange={(e) => set("garnish", e.target.value)} />
          </div>
        </div>

        <div>
          <Label>口味标签</Label>
          <div className="flex gap-2">
            <Input
              value={flavorInput}
              onChange={(e) => setFlavorInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFlavor())}
              placeholder="输入后回车添加"
            />
            <Button type="button" variant="outline" onClick={addFlavor}>
              添加
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {form.flavorTags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-3 py-1 text-sm text-accent"
              >
                {t}
                <button
                  onClick={() =>
                    set(
                      "flavorTags",
                      form.flavorTags.filter((x) => x !== t)
                    )
                  }
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <Label>描述 / 背景</Label>
          <Textarea
            rows={3}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>

        {/* Ingredients */}
        <div>
          <Label>配方原料</Label>
          <div className="space-y-2">
            {form.ingredients.map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <select
                  value={row.ingredientId}
                  onChange={(e) => setRow(i, { ingredientId: e.target.value })}
                  className="h-10 flex-1 rounded-xl border border-border bg-card px-2 text-sm text-ink"
                >
                  <option value="">选择材料</option>
                  {allIngredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name}
                    </option>
                  ))}
                </select>
                <input
                  value={row.amount}
                  onChange={(e) => setRow(i, { amount: e.target.value })}
                  placeholder="份量"
                  className="h-10 w-24 rounded-xl border border-border bg-card px-2 text-sm text-ink"
                />
                <label className="flex items-center gap-1 text-xs text-muted">
                  <input
                    type="checkbox"
                    checked={row.isOptional}
                    onChange={(e) => setRow(i, { isOptional: e.target.checked })}
                  />
                  可选
                </label>
                <button
                  onClick={() => removeRow(i)}
                  className="rounded-full p-1.5 text-muted hover:text-red-600"
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
            <Plus className="h-4 w-4" /> 添加原料
          </button>
        </div>

        {/* Steps */}
        <div>
          <Label>调制步骤</Label>
          <div className="space-y-2">
            {form.instructions.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs text-cream">
                  {i + 1}
                </span>
                <input
                  value={step}
                  onChange={(e) => setStep(i, e.target.value)}
                  className="h-10 flex-1 rounded-xl border border-border bg-card px-3 text-sm text-ink"
                />
                <button
                  onClick={() => removeStep(i)}
                  className="rounded-full p-1.5 text-muted hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addStep}
            className="mt-2 inline-flex items-center gap-1 text-sm text-accent"
          >
            <Plus className="h-4 w-4" /> 添加步骤
          </button>
        </div>

        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => set("isPublished", e.target.checked)}
          />
          发布（在前台可见）
        </label>

        <Button size="lg" className="w-full" onClick={submit} disabled={saving}>
          {saving ? "保存中…" : "保存"}
        </Button>
      </div>
    </div>
  );
}
