import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { ok, errors } from "@/lib/api";
import { adminCocktailSchema } from "@/lib/validations";
import { stringifyStringArray } from "@/lib/serialize";

// PUT /api/admin/cocktails/[id] — replace fields and ingredient rows.
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin();
  if (!admin) return errors.forbidden();

  const existing = await prisma.cocktail.findUnique({ where: { id: params.id } });
  if (!existing) return errors.notFound("配方");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errors.badRequest();
  }
  const parsed = adminCocktailSchema.safeParse(body);
  if (!parsed.success) return errors.badRequest(parsed.error.issues[0]?.message);
  const d = parsed.data;

  // Replace ingredient rows wholesale for simplicity.
  await prisma.cocktailIngredient.deleteMany({ where: { cocktailId: params.id } });

  const updated = await prisma.cocktail.update({
    where: { id: params.id },
    data: {
      name: d.name,
      nameEn: d.nameEn || null,
      slug: d.slug,
      category: d.category,
      flavorTags: stringifyStringArray(d.flavorTags),
      glassType: d.glassType || null,
      garnish: d.garnish || null,
      description: d.description || null,
      instructions: stringifyStringArray(d.instructions),
      imageUrl: d.imageUrl || null,
      difficulty: d.difficulty,
      isPublished: d.isPublished,
      ingredients: {
        create: d.ingredients.map((ing, i) => ({
          ingredientId: ing.ingredientId,
          amount: ing.amount || null,
          isOptional: ing.isOptional,
          sortOrder: i,
        })),
      },
    },
  });
  return ok(updated);
}

// DELETE /api/admin/cocktails/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin();
  if (!admin) return errors.forbidden();

  const existing = await prisma.cocktail.findUnique({ where: { id: params.id } });
  if (!existing) return errors.notFound("配方");

  await prisma.cocktail.delete({ where: { id: params.id } });
  return ok({ id: params.id });
}
