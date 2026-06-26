import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { toCocktailWithIngredientsDTO, toCocktailDTO } from "@/lib/dto";
import { difficultyLabel } from "@/lib/constants";
import CocktailThumb from "@/components/cocktail/CocktailThumb";
import CocktailCard from "@/components/cocktail/CocktailCard";
import RecipeActions from "@/components/cocktail/RecipeActions";

async function getCocktail(slug: string) {
  const c = await prisma.cocktail.findUnique({
    where: { slug },
    include: {
      ingredients: { include: { ingredient: true }, orderBy: { sortOrder: "asc" } },
    },
  });
  if (!c || !c.isPublished) return null;
  return toCocktailWithIngredientsDTO(c);
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const c = await getCocktail(params.slug);
  if (!c) return { title: "配方未找到" };
  return {
    title: c.name,
    description: c.description ?? `${c.name} 的配方与调制方法`,
  };
}

export default async function CocktailDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const cocktail = await getCocktail(params.slug);
  if (!cocktail) notFound();

  // Related: same category, exclude self, up to 4.
  const relatedRows = await prisma.cocktail.findMany({
    where: { isPublished: true, category: cocktail.category, id: { not: cocktail.id } },
    take: 4,
  });
  const related = relatedRows.map(toCocktailDTO);

  return (
    <main>
      {/* Hero image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <CocktailThumb src={cocktail.imageUrl} alt={cocktail.name} />
        <Link
          href="/"
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-card/90 text-ink backdrop-blur"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>

      <div className="px-5 pt-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs text-accent">
            {cocktail.category}
          </span>
          <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted">
            难度 · {difficultyLabel(cocktail.difficulty)}
          </span>
        </div>

        <h1 className="mt-3 text-2xl font-bold text-ink">{cocktail.name}</h1>
        {cocktail.nameEn && <p className="text-sm text-muted">{cocktail.nameEn}</p>}

        <div className="mt-4">
          <RecipeActions cocktailId={cocktail.id} slug={cocktail.slug} />
        </div>

        {/* Ingredients */}
        <section className="mt-7">
          <h2 className="text-lg font-bold text-ink">配方</h2>
          <ul className="mt-3 divide-y divide-border rounded-2xl border border-border bg-card">
            {cocktail.ingredients.map((ci) => (
              <li key={ci.id} className="flex items-center justify-between px-4 py-3">
                <span className="text-ink">
                  {ci.ingredient.name}
                  {ci.isOptional && (
                    <span className="ml-2 text-xs text-muted">可选</span>
                  )}
                </span>
                <span className="text-sm text-muted">{ci.amount}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Steps */}
        {cocktail.instructions.length > 0 && (
          <section className="mt-7">
            <h2 className="text-lg font-bold text-ink">调制步骤</h2>
            <ol className="mt-3 space-y-3">
              {cocktail.instructions.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-semibold text-cream">
                    {i + 1}
                  </span>
                  <span className="text-ink">{step}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Meta */}
        {(cocktail.glassType || cocktail.garnish) && (
          <section className="mt-7 grid grid-cols-2 gap-3">
            {cocktail.glassType && (
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs text-muted">推荐杯型</p>
                <p className="mt-1 font-medium text-ink">{cocktail.glassType}</p>
              </div>
            )}
            {cocktail.garnish && (
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs text-muted">装饰物</p>
                <p className="mt-1 font-medium text-ink">{cocktail.garnish}</p>
              </div>
            )}
          </section>
        )}

        {/* Background */}
        {cocktail.description && (
          <section className="mt-7">
            <h2 className="text-lg font-bold text-ink">关于这杯</h2>
            <p className="mt-2 leading-relaxed text-ink/80">{cocktail.description}</p>
          </section>
        )}

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-9">
            <h2 className="text-lg font-bold text-ink">相关推荐</h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {related.map((c) => (
                <CocktailCard key={c.id} cocktail={c} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
