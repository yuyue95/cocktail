import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ok, errors } from "@/lib/api";
import { toUserCocktailDTO } from "@/lib/dto";
import { userCocktailSchema } from "@/lib/validations";
import {
  stringifyStringArray,
  stringifyRecipeIngredients,
} from "@/lib/serialize";

// Ownership-guarded lookup: a user can only ever touch their own recipes.
async function findOwned(userId: string, id: string) {
  return prisma.userCocktail.findFirst({ where: { id, userId } });
}

// GET /api/my/cocktails/:id
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireUser();
  if (!user) return errors.unauthorized();

  const row = await findOwned(user.id, params.id);
  if (!row) return errors.notFound("配方");
  return ok(toUserCocktailDTO(row));
}

// PUT /api/my/cocktails/:id
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireUser();
  if (!user) return errors.unauthorized();

  const existing = await findOwned(user.id, params.id);
  if (!existing) return errors.notFound("配方");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errors.badRequest();
  }
  const parsed = userCocktailSchema.safeParse(body);
  if (!parsed.success) return errors.badRequest(parsed.error.issues[0]?.message);
  const d = parsed.data;

  const dupe = await prisma.userCocktail.findFirst({
    where: { userId: user.id, name: d.name, id: { not: params.id } },
  });
  if (dupe) return errors.conflict("你的配方库里已经有同名酒了");

  const updated = await prisma.userCocktail.update({
    where: { id: params.id },
    data: {
      name: d.name,
      nameEn: d.nameEn || null,
      category: d.category,
      flavorTags: stringifyStringArray(d.flavorTags),
      glassType: d.glassType || null,
      garnish: d.garnish || null,
      description: d.description || null,
      instructions: stringifyStringArray(d.instructions),
      ingredients: stringifyRecipeIngredients(d.ingredients),
      imageUrl: d.imageUrl || null,
      difficulty: d.difficulty,
    },
  });
  return ok(toUserCocktailDTO(updated));
}

// DELETE /api/my/cocktails/:id
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireUser();
  if (!user) return errors.unauthorized();

  const existing = await findOwned(user.id, params.id);
  if (!existing) return errors.notFound("配方");

  await prisma.userCocktail.delete({ where: { id: params.id } });
  return ok({ id: params.id });
}
