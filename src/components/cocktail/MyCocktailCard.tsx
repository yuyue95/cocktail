import Link from "next/link";
import CocktailThumb from "@/components/cocktail/CocktailThumb";
import type { UserCocktailDTO } from "@/lib/dto";

// Grid card for a personal recipe. Mirrors CocktailCard but links to the
// owner-only detail route and carries a "我的配方" badge.
export default function MyCocktailCard({
  cocktail,
}: {
  cocktail: UserCocktailDTO;
}) {
  return (
    <Link
      href={`/my/cocktails/${cocktail.id}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <CocktailThumb
          src={cocktail.imageUrl}
          alt={cocktail.name}
          className="transition group-hover:scale-105"
        />
        <span className="absolute left-2 top-2 rounded-full bg-ink/80 px-2 py-0.5 text-xs text-cream backdrop-blur">
          我的配方
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-baseline gap-2">
          <h3 className="font-semibold text-ink">{cocktail.name}</h3>
          {cocktail.nameEn && (
            <span className="truncate text-xs text-muted">{cocktail.nameEn}</span>
          )}
        </div>
        {cocktail.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted">
            {cocktail.description}
          </p>
        )}
        {cocktail.flavorTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {cocktail.flavorTags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
