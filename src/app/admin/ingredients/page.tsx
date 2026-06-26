"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label } from "@/components/ui/Input";
import { getJSON, sendJSON } from "@/lib/fetcher";
import { INGREDIENT_TYPES, ingredientTypeLabel } from "@/lib/constants";

type Ingredient = {
  id: string;
  name: string;
  nameEn: string | null;
  type: string;
  description: string | null;
  abv: number | null;
  imageUrl: string | null;
};

type IngredientForm = {
  id: string;
  name: string;
  nameEn: string;
  type: string;
  description: string;
  abv: string;
  imageUrl: string;
};

const EMPTY: IngredientForm = {
  id: "",
  name: "",
  nameEn: "",
  type: INGREDIENT_TYPES[0].value,
  description: "",
  abv: "",
  imageUrl: "",
};

export default function AdminIngredientsPage() {
  const [items, setItems] = useState<Ingredient[]>([]);
  const [editing, setEditing] = useState<typeof EMPTY | null>(null);

  async function load() {
    setItems(await getJSON<Ingredient[]>("/api/ingredients"));
  }
  useEffect(() => {
    load();
  }, []);

  async function save() {
    if (!editing) return;
    const payload = {
      name: editing.name,
      nameEn: editing.nameEn || null,
      type: editing.type,
      description: editing.description || null,
      abv: editing.abv === "" ? null : Number(editing.abv),
      imageUrl: editing.imageUrl || null,
    };
    try {
      if (editing.id) {
        await sendJSON(`/api/admin/ingredients/${editing.id}`, "PUT", payload);
      } else {
        await sendJSON("/api/admin/ingredients", "POST", payload);
      }
      setEditing(null);
      await load();
      toast.success("已保存");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "保存失败");
    }
  }

  async function remove(id: string) {
    if (!confirm("确定删除这个材料？")) return;
    try {
      await sendJSON(`/api/admin/ingredients/${id}`, "DELETE");
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("已删除");
    } catch {
      toast.error("删除失败");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">原料管理</h1>
        <button
          onClick={() => setEditing({ ...EMPTY })}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm text-cream"
        >
          <Plus className="h-4 w-4" /> 新建
        </button>
      </div>

      <div className="mt-5 divide-y divide-border rounded-2xl border border-border bg-card">
        {items.map((i) => (
          <div key={i.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-medium text-ink">
                {i.name}
                {i.nameEn && <span className="ml-2 text-xs text-muted">{i.nameEn}</span>}
              </p>
              <p className="text-xs text-muted">
                {ingredientTypeLabel(i.type)}
                {i.abv != null && ` · ${i.abv}% vol`}
              </p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() =>
                  setEditing({
                    id: i.id,
                    name: i.name,
                    nameEn: i.nameEn ?? "",
                    type: i.type,
                    description: i.description ?? "",
                    abv: i.abv != null ? String(i.abv) : "",
                    imageUrl: i.imageUrl ?? "",
                  })
                }
                className="rounded-full p-2 text-muted hover:bg-cream hover:text-ink"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => remove(i.id)}
                className="rounded-full p-2 text-muted hover:bg-cream hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "编辑材料" : "新建材料"}
      >
        {editing && (
          <div className="space-y-3">
            <div>
              <Label>名称</Label>
              <Input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </div>
            <div>
              <Label>英文名</Label>
              <Input
                value={editing.nameEn}
                onChange={(e) => setEditing({ ...editing, nameEn: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>类型</Label>
                <select
                  value={editing.type}
                  onChange={(e) => setEditing({ ...editing, type: e.target.value })}
                  className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-ink"
                >
                  {INGREDIENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>酒精度 %</Label>
                <Input
                  type="number"
                  value={editing.abv}
                  onChange={(e) => setEditing({ ...editing, abv: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>描述</Label>
              <Textarea
                rows={2}
                value={editing.description}
                onChange={(e) =>
                  setEditing({ ...editing, description: e.target.value })
                }
              />
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
