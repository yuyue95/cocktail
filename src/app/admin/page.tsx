import { prisma } from "@/lib/prisma";

// Admin dashboard: a few counts to give an at-a-glance picture of the dataset.
export default async function AdminDashboard() {
  const [cocktails, published, ingredients, articles, users, drinkLogs] =
    await Promise.all([
      prisma.cocktail.count(),
      prisma.cocktail.count({ where: { isPublished: true } }),
      prisma.ingredient.count(),
      prisma.article.count(),
      prisma.user.count(),
      prisma.drinkLog.count(),
    ]);

  const stats = [
    { label: "酒谱总数", value: cocktails },
    { label: "已发布", value: published },
    { label: "原料", value: ingredients },
    { label: "文章", value: articles },
    { label: "用户", value: users },
    { label: "调酒记录", value: drinkLogs },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold text-ink">概览</h1>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <p className="text-2xl font-bold text-ink">{s.value}</p>
            <p className="mt-1 text-sm text-muted">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
