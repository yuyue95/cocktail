import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { ok, errors } from "@/lib/api";
import { userIngredientSchema } from "@/lib/validations";

// GET /api/user-ingredients
// The current user's "what I have at home" list (drinker mode).
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return errors.unauthorized();

  const items = await prisma.userIngredient.findMany({
    where: { userId: user.id },
    include: { ingredient: true },
    orderBy: { createdAt: "desc" },
  });
  return ok(items);
}

// POST /api/user-ingredients  { ingredientId, amountNote? }
// Errors: 409 if the ingredient is already in the user's bar.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return errors.unauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errors.badRequest();
  }
  const parsed = userIngredientSchema.safeParse(body);
  if (!parsed.success) return errors.badRequest(parsed.error.issues[0]?.message);

  const existing = await prisma.userIngredient.findUnique({
    where: {
      userId_ingredientId: {
        userId: user.id,
        ingredientId: parsed.data.ingredientId,
      },
    },
  });
  if (existing) return errors.conflict("这个材料已经在你的吧台里了");

  const created = await prisma.userIngredient.create({
    data: {
      userId: user.id,
      ingredientId: parsed.data.ingredientId,
      amountNote: parsed.data.amountNote || null,
    },
    include: { ingredient: true },
  });
  return ok(created, undefined, 201);
}
