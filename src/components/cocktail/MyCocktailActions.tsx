"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { sendJSON } from "@/lib/fetcher";

// Edit + delete controls on a personal recipe detail page.
export default function MyCocktailActions({ id }: { id: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    if (!confirm("确定从你的配方库删除这杯？")) return;
    setDeleting(true);
    try {
      await sendJSON(`/api/my/cocktails/${id}`, "DELETE");
      toast.success("已删除");
      router.push("/my/cocktails");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "删除失败");
      setDeleting(false);
    }
  }

  return (
    <div className="flex gap-2">
      <Link
        href={`/my/cocktails/${id}/edit`}
        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-ink py-2.5 text-sm text-cream"
      >
        <Pencil className="h-4 w-4" /> 编辑
      </Link>
      <button
        onClick={remove}
        disabled={deleting}
        className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border px-4 py-2.5 text-sm text-muted transition hover:text-red-600 disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" /> 删除
      </button>
    </div>
  );
}
