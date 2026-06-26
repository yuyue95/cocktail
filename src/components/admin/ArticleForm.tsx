"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Input, Textarea, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { sendJSON } from "@/lib/fetcher";

export type ArticleFormInitial = {
  id?: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  isPublished: boolean;
};

const EMPTY: ArticleFormInitial = {
  title: "",
  slug: "",
  content: "",
  category: "",
  isPublished: false,
};

// Markdown editor with a live preview pane on the right.
export default function ArticleForm({
  initial,
}: {
  initial?: ArticleFormInitial;
}) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [form, setForm] = useState<ArticleFormInitial>(initial ?? EMPTY);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof ArticleFormInitial>(
    key: K,
    value: ArticleFormInitial[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit() {
    if (!form.title || !form.slug || !form.content) {
      toast.error("标题、slug、正文必填");
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title,
      slug: form.slug,
      content: form.content,
      category: form.category || null,
      isPublished: form.isPublished,
    };
    try {
      if (isEdit) {
        await sendJSON(`/api/admin/articles/${initial!.id}`, "PUT", payload);
      } else {
        await sendJSON("/api/admin/articles", "POST", payload);
      }
      toast.success("已保存");
      router.push("/admin/articles");
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
          href="/admin/articles"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-bold text-ink">
          {isEdit ? "编辑文章" : "新建文章"}
        </h1>
      </div>

      <div className="mt-6 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Label>标题</Label>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div>
            <Label>分类</Label>
            <Input
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label>Slug</Label>
          <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label>正文 (Markdown)</Label>
            <Textarea
              rows={18}
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              className="font-mono text-xs"
            />
          </div>
          <div>
            <Label>预览</Label>
            <div className="prose-cocktail h-[26rem] overflow-y-auto rounded-xl border border-border bg-card p-4">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {form.content || "_开始输入即可预览_"}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => set("isPublished", e.target.checked)}
          />
          发布
        </label>

        <Button size="lg" className="w-full" onClick={submit} disabled={saving}>
          {saving ? "保存中…" : "保存"}
        </Button>
      </div>
    </div>
  );
}
