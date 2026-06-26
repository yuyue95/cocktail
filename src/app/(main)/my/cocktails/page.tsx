import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Plus, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { toUserCocktailDTO } from "@/lib/dto";
import MyCocktailCard from "@/components/cocktail/MyCocktailCard";

export const metadata: Metadata = { title: "我的配方库" };

export default async function MyCocktailsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/my/cocktails");

  const rows = await prisma.userCocktail.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });
  const recipes = rows.map(toUserCocktailDTO);

  return (
    <main className="px-5 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/profile"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-xl font-bold text-ink">我的配方库</h1>
        </div>
        <Link
          href="/my/cocktails/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm text-cream"
        >
          <Plus className="h-4 w-4" /> 新建
        </Link>
      </div>

      <p className="mt-2 text-sm text-muted">
        共 {recipes.length} 杯 · 这些配方只有你能看到，并会出现在你的搜索结果里。
      </p>

      {recipes.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <p className="text-3xl">🍹</p>
          <p className="mt-3 font-medium text-ink">还没有自己的配方</p>
          <p className="mt-1 text-sm text-muted">
            把你调过、想记下的酒加进来，知识库会越来越丰富。
          </p>
          <Link
            href="/my/cocktails/new"
            className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm text-cream"
          >
            <Plus className="h-4 w-4" /> 添加第一杯
          </Link>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3">
          {recipes.map((c) => (
            <MyCocktailCard key={c.id} cocktail={c} />
          ))}
        </div>
      )}
    </main>
  );
}
