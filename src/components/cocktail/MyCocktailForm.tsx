"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label } from "@/components/ui/Input";
import { sendJSON } from "@/lib/fetcher";
import {
  COCKTAIL_CATEGORIES,
  DIFFICULTIES,
  FLAVOR_TAGS,
} from "@/lib/constants";
import type { UserCocktailDTO } from "@/lib/dto";
import type { RecipeIngredient } from "@/lib/serialize";

type Props = {
  // Present in edit mode; absent when creating a new recipe.
  initial?: UserCocktailDTO;
};

// Shared create/edit form for personal recipes. Ingredients and steps are
// free-text rows the user can add/remove inline.
export default function MyCocktailForm({ initial }: Props) {
  const router = useRouter();
  const isEdit = !!initial;

  const [name, setName] = useState(initial?.name ?? "");
  const [nameEn, setNameEn] = useState(initial?.nameEn ?? "");
  const [category, setCategory] = useState(
    initial?.category ?? COCKTAIL_CATEGORIES[0]
  );
  const [difficulty, setDifficulty] = useState(initial?.difficulty ?? "easy");
  const [glassType, setGlassType] = useState(initial?.glassType ?? "");
  const [garnish, setGarnish] = useState(initial?.garnish ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [flavorTags, setFlavorTags] = useState<string[]>(
    initial?.flavorTags ?? []
  );
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(
    initial?.ingredients?.length
      ? initial.ingredients
      : [{ name: "", amount: "", isOptional: false }]
  );
  const [steps, setSteps] = useState<string[]>(
    initial?.instructions?.length ? initial.instructions : [""]
  );
  const [saving, setSaving] = useState(false);

  function toggleTag(tag: string) {
    setFlavorTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function setIngredient(i: number, patch: Partial<RecipeIngredient>) {
    setIngredients((prev) =>
      prev.map((row, idx) => (idx === i ? { ...row, ...patch } : row))
    );
  }

  async function submit() {
    const cleanedIngredients = ingredients
      .map((r) => ({ ...r, name: r.name.trim(), amount: r.amount.trim() }))
      .filter((r) => r.name);
    if (!name.trim()) return toast.error("请输入名称");
    if (cleanedIngredients.length === 0) return toast.error("至少添加一种材料");

    const payload = {
      name: name.trim(),
      nameEn: nameEn.trim() || null,
      category,
      flavorTags,
      glassType: glassType.trim() || null,
      garnish: garnish.trim() || null,
      description: description.trim() || null,
      instructions: steps.map((s) => s.trim()).filter(Boolean),
      imageUrl: imageUrl.trim() || null,
      difficulty,
      ingredients: cleanedIngredients,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await sendJSON(`/api/my/cocktails/${initial!.id}`, "PUT", payload);
        toast.success("已更新");
        router.push(`/my/cocktails/${initial!.id}`);
      } else {
        const created = await sendJSON<UserCocktailDTO>(
          "/api/my/cocktails",
          "POST",
          payload
        );
        toast.success("已加入你的配方库");
        router.push(`/my/cocktails/${created.id}`);
      }
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 pb-10">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label>名称 *</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：自调青柠高球"
          />
        </div>
        <div className="col-span-2">
          <Label>英文名</Label>
          <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
        </div>
        <div>
          <Label>分类</Label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
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
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-ink"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ingredients */}
      <div>
        <div className="flex items-center justify-between">
          <Label>材料 *</Label>
          <button
            type="button"
            onClick={() =>
              setIngredients((prev) => [
                ...prev,
                { name: "", amount: "", isOptional: false },
              ])
            }
            className="inline-flex items-center gap-1 text-sm text-accent"
          >
            <Plus className="h-4 w-4" /> 加一行
          </button>
        </div>
        <div className="mt-2 space-y-2">
          {ingredients.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={row.name}
                onChange={(e) => setIngredient(i, { name: e.target.value })}
                placeholder="材料"
                className="flex-1"
              />
              <Input
                value={row.amount}
                onChange={(e) => setIngredient(i, { amount: e.target.value })}
                placeholder="用量"
                className="w-24"
              />
              <button
                type="button"
                onClick={() => setIngredient(i, { isOptional: !row.isOptional })}
                className={`shrink-0 rounded-full border px-2.5 py-1 text-xs transition ${
                  row.isOptional
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border text-muted"
                }`}
              >
                可选
              </button>
              <button
                type="button"
                onClick={() =>
                  setIngredients((prev) => prev.filter((_, idx) => idx !== i))
                }
                className="shrink-0 rounded-full p-2 text-muted hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div>
        <div className="flex items-center justify-between">
          <Label>调制步骤</Label>
          <button
            type="button"
            onClick={() => setSteps((prev) => [...prev, ""])}
            className="inline-flex items-center gap-1 text-sm text-accent"
          >
            <Plus className="h-4 w-4" /> 加一步
          </button>
        </div>
        <div className="mt-2 space-y-2">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-semibold text-cream">
                {i + 1}
              </span>
              <Input
                value={step}
                onChange={(e) =>
                  setSteps((prev) =>
                    prev.map((s, idx) => (idx === i ? e.target.value : s))
                  )
                }
                placeholder="描述这一步"
                className="flex-1"
              />
              <button
                type="button"
                onClick={() =>
                  setSteps((prev) => prev.filter((_, idx) => idx !== i))
                }
                className="shrink-0 rounded-full p-2 text-muted hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Flavor tags */}
      <div>
        <Label>口味标签</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {FLAVOR_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`rounded-full border px-3 py-1 text-sm transition ${
                flavorTags.includes(tag)
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-border text-muted"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>推荐杯型</Label>
          <Input value={glassType} onChange={(e) => setGlassType(e.target.value)} />
        </div>
        <div>
          <Label>装饰物</Label>
          <Input value={garnish} onChange={(e) => setGarnish(e.target.value)} />
        </div>
      </div>

      <div>
        <Label>图片链接</Label>
        <Input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://…（可留空）"
        />
      </div>

      <div>
        <Label>关于这杯 / 调酒思考</Label>
        <Textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <Button className="w-full" size="lg" onClick={submit} disabled={saving}>
        {saving ? "保存中…" : isEdit ? "保存修改" : "加入我的配方库"}
      </Button>
    </div>
  );
}
