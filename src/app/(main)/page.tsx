import Link from "next/link";
import { PencilLine, ArrowRight, CalendarDays } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { toCocktailDTO } from "@/lib/dto";
import { COCKTAIL_CATEGORIES } from "@/lib/constants";
import TopBar from "@/components/layout/TopBar";
import RecommendSection from "@/components/cocktail/RecommendSection";
import SearchSection from "@/components/cocktail/SearchSection";

// Home is public: anyone can browse recipes and search. Personalized actions
// (logging, bar) live behind auth and are reached via the quick links.
export default async function HomePage() {
  const firstCategory = COCKTAIL_CATEGORIES[0];
  const rows = await prisma.cocktail.findMany({
    where: { isPublished: true, category: firstCategory },
    take: 3,
    orderBy: { createdAt: "asc" },
  });
  const initialCocktails = rows.map(toCocktailDTO);

  return (
    <main>
      <TopBar />

      {/* Quick actions */}
      <div className="flex items-center gap-3 px-5 pt-6">
        <Link
          href="/calendar/new"
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ink py-4 font-medium text-cream transition hover:opacity-90"
        >
          <PencilLine className="h-4 w-4" /> 随手记一杯
        </Link>
        <Link
          href="/bar"
          className="flex items-center gap-1.5 rounded-full border border-border bg-card px-5 py-4 text-sm font-medium text-ink transition hover:bg-cream"
        >
          去吧台 <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Calendar teaser */}
      <section className="px-5 pt-6">
        <Link
          href="/calendar"
          className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 transition hover:shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <CalendarDays className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-ink">调酒日历</p>
              <p className="text-sm text-muted">记录你品饮的每一天与每一次心得</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted" />
        </Link>
      </section>

      <RecommendSection
        categories={[...COCKTAIL_CATEGORIES]}
        initialCategory={firstCategory}
        initialCocktails={initialCocktails}
      />

      <SearchSection />
    </main>
  );
}
