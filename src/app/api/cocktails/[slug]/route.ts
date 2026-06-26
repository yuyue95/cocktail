import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, errors } from "@/lib/api";
import { toCocktailWithIngredientsDTO } from "@/lib/dto";

// GET /api/cocktails/[slug]
// Output: { data: CocktailWithIngredientsDTO }
// Errors: 404 when slug not found
export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const cocktail = await prisma.cocktail.findUnique({
    where: { slug: params.slug },
    include: {
      ingredients: {
        include: { ingredient: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!cocktail || !cocktail.isPublished) {
    return errors.notFound("配方");
  }

  return ok(toCocktailWithIngredientsDTO(cocktail));
}
