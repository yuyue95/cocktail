"use client";

import { useState } from "react";
import { Heart, BookmarkPlus, PencilLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { sendJSON } from "@/lib/fetcher";
import { cn } from "@/lib/utils";

// Recipe detail actions: favorite, add-to-want-list, and log this drink.
// Requires login; unauthenticated taps route to /login.
export default function RecipeActions({
  cocktailId,
  slug,
}: {
  cocktailId: string;
  slug: string;
}) {
  const router = useRouter();
  const { status } = useSession();
  const [fav, setFav] = useState(false);
  const [want, setWant] = useState(false);

  function guard(): boolean {
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=/cocktails/${slug}`);
      return false;
    }
    return true;
  }

  async function toggle(listType: "favorite" | "want_to_make") {
    if (!guard()) return;
    const isFav = listType === "favorite";
    const current = isFav ? fav : want;
    try {
      if (current) {
        await sendJSON(
          `/api/user-cocktail-list?cocktailId=${cocktailId}&type=${listType}`,
          "DELETE"
        );
      } else {
        await sendJSON("/api/user-cocktail-list", "POST", { cocktailId, listType });
      }
      if (isFav) setFav(!current);
      else setWant(!current);
      toast.success(current ? "已移除" : "已添加");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "操作失败");
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => toggle("favorite")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition",
          fav ? "border-accent bg-accent-soft text-accent" : "border-border bg-card text-ink"
        )}
      >
        <Heart className={cn("h-4 w-4", fav && "fill-accent")} /> 收藏
      </button>
      <button
        onClick={() => toggle("want_to_make")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition",
          want ? "border-accent bg-accent-soft text-accent" : "border-border bg-card text-ink"
        )}
      >
        <BookmarkPlus className="h-4 w-4" /> 想做
      </button>
      <button
        onClick={() => {
          if (guard()) router.push(`/calendar/new?cocktailId=${cocktailId}`);
        }}
        className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm text-cream transition hover:opacity-90"
      >
        <PencilLine className="h-4 w-4" /> 记录喝过
      </button>
    </div>
  );
}
