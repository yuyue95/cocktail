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

// GET /api/my/cocktails?search= — the signed-in user's personal recipes.
export async function GET(req: NextRequest) {
  const user = await requireUser();
  if (!user) return errors.unauthorized();

  const search = (req.nextUrl.searchParams.get("search") || "").trim();
  const rows = await prisma.userCocktail.findMany({
    where: {
      userId: user.id,
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { nameEn: { contains: search } },
              { description: { contains: search } },
              { ingredients: { contains: search } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
  });
  return ok(rows.map(toUserCocktailDTO));
}

// POST /api/my/cocktails — add a recipe to the user's personal library.
export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user) return errors.unauthorized();

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
    where: { userId: user.id, name: d.name },
  });
  if (dupe) return errors.conflict("你的配方库里已经有同名酒了");

  const created = await prisma.userCocktail.create({
    data: {
      userId: user.id,
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
  return ok(toUserCocktailDTO(created), undefined, 201);
}
