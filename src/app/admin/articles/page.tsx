"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getJSON, sendJSON } from "@/lib/fetcher";

type Row = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  isPublished: boolean;
};

export default function AdminArticlesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJSON<Row[]>("/api/admin/articles")
      .then(setRows)
      .catch(() => toast.error("加载失败"))
      .finally(() => setLoading(false));
  }, []);

  async function remove(id: string) {
    if (!confirm("确定删除这篇文章？")) return;
    try {
      await sendJSON(`/api/admin/articles/${id}`, "DELETE");
      setRows((prev) => prev.filter((r) => r.id !== id));
      toast.success("已删除");
    } catch {
      toast.error("删除失败");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">文章管理</h1>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm text-cream"
        >
          <Plus className="h-4 w-4" /> 新建
        </Link>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-muted">加载中…</p>
      ) : (
        <div className="mt-5 divide-y divide-border rounded-2xl border border-border bg-card">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium text-ink">
                  {r.title}
                  {!r.isPublished && (
                    <span className="ml-2 rounded-full bg-cream px-2 py-0.5 text-xs text-muted">
                      草稿
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted">{r.category ?? "未分类"}</p>
              </div>
              <div className="flex gap-1">
                <Link
                  href={`/admin/articles/${r.id}/edit`}
                  className="rounded-full p-2 text-muted hover:bg-cream hover:text-ink"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => remove(r.id)}
                  className="rounded-full p-2 text-muted hover:bg-cream hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="py-8 text-center text-sm text-muted">还没有文章</p>
          )}
        </div>
      )}
    </div>
  );
}
