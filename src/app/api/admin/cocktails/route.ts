import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { ok, errors } from "@/lib/api";
import { adminCocktailSchema } from "@/lib/validations";
import { stringifyStringArray } from "@/lib/serialize";

// GET /api/admin/cocktails — full list (published + drafts) for the admin table.
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return errors.forbidden();

  const rows = await prisma.cocktail.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      difficulty: true,
      isPublished: true,
    },
  });
  return ok(rows);
}

// POST /api/admin/cocktails — create a cocktail with its ingredient rows.
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return errors.forbidden();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errors.badRequest();
  }
  const parsed = adminCocktailSchema.safeParse(body);
  if (!parsed.success) return errors.badRequest(parsed.error.issues[0]?.message);
  const d = parsed.data;

  const dupe = await prisma.cocktail.findFirst({
    where: { OR: [{ slug: d.slug }, { name: d.name }] },
  });
  if (dupe) return errors.conflict("名称或 slug 已存在");

  const created = await prisma.cocktail.create({
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
  return ok(created, undefined, 201);
}
