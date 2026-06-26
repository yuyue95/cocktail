import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { ok, errors } from "@/lib/api";
import { toCocktailDTO } from "@/lib/dto";

// GET /api/recommendations/by-ingredients
// Logic:
//   1. Collect the user's owned ingredient ids.
//   2. For every published cocktail, look only at its REQUIRED ingredients
//      (optional ones are ignored — you can skip a garnish).
//   3. Bucket by how many required ingredients are missing:
//        exact      -> 0 missing (you can make it now)
//        missingOne -> exactly 1 missing
//   4. Return both buckets; missingOne includes the names still needed.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return errors.unauthorized();

  const owned = await prisma.userIngredient.findMany({
    where: { userId: user.id },
    select: { ingredientId: true },
  });
  const ownedSet = new Set(owned.map((o) => o.ingredientId));

  const cocktails = await prisma.cocktail.findMany({
    where: { isPublished: true },
    include: { ingredients: { include: { ingredient: true } } },
  });

  const exact: ReturnType<typeof toCocktailDTO>[] = [];
  const missingOne: {
    cocktail: ReturnType<typeof toCocktailDTO>;
    missing: { id: string; name: string }[];
  }[] = [];

  for (const c of cocktails) {
    const required = c.ingredients.filter((ci) => !ci.isOptional);
    if (required.length === 0) continue;

    const missing = required
      .filter((ci) => !ownedSet.has(ci.ingredientId))
      .map((ci) => ({ id: ci.ingredient.id, name: ci.ingredient.name }));

    if (missing.length === 0) {
      exact.push(toCocktailDTO(c));
    } else if (missing.length === 1) {
      missingOne.push({ cocktail: toCocktailDTO(c), missing });
    }
  }

  return ok({ exact, missingOne, ownedCount: ownedSet.size });
}
