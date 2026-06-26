import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, BookOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "知识库" };

// Knowledge base list, grouped by category. Reachable from the home search
// area (the standalone 探索 tab was folded into home).
export default async function KnowledgePage() {
  const articles = await prisma.article.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, slug: true, category: true },
  });

  const groups = articles.reduce<Record<string, typeof articles>>((acc, a) => {
    const key = a.category ?? "其他";
    (acc[key] ??= []).push(a);
    return acc;
  }, {});

  return (
    <main className="px-5 pt-6">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-bold text-ink">知识库</h1>
      </div>

      <div className="mt-6 space-y-7">
        {Object.entries(groups).map(([category, list]) => (
          <section key={category}>
            <h2 className="mb-2 text-sm font-semibold text-muted">{category}</h2>
            <div className="divide-y divide-border rounded-2xl border border-border bg-card">
              {list.map((a) => (
                <Link
                  key={a.id}
                  href={`/knowledge/${a.slug}`}
                  className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-cream"
                >
                  <BookOpen className="h-4 w-4 text-accent" />
                  <span className="text-ink">{a.title}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
