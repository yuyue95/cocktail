import Link from "next/link";
import CocktailThumb from "@/components/cocktail/CocktailThumb";
import type { CocktailDTO } from "@/lib/dto";

// Grid card used in lists and search results (image on top, meta below).
export default function CocktailCard({ cocktail }: { cocktail: CocktailDTO }) {
  return (
    <Link
      href={`/cocktails/${cocktail.slug}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-md"
    >
      <div className="aspect-[4/3] w-full overflow-hidden">
        <CocktailThumb
          src={cocktail.imageUrl}
          alt={cocktail.name}
          className="transition group-hover:scale-105"
        />
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

// Compact numbered row used in the home "配方推荐" list.
export function CocktailRow({
  cocktail,
  index,
}: {
  cocktail: CocktailDTO;
  index: number;
}) {
  return (
    <Link
      href={`/cocktails/${cocktail.slug}`}
      className="flex items-center gap-3 border-b border-border py-3 last:border-0"
    >
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg">
        <CocktailThumb src={cocktail.imageUrl} alt={cocktail.name} />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="font-semibold text-ink">{cocktail.name}</h4>
        {cocktail.description && (
          <p className="line-clamp-1 text-sm text-muted">{cocktail.description}</p>
        )}
      </div>
      <span className="text-lg font-bold text-border">{index + 1}</span>
    </Link>
  );
}
