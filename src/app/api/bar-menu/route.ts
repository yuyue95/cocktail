import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { ok, errors } from "@/lib/api";
import { barMenuSchema } from "@/lib/validations";

// GET /api/bar-menu — the bartender's own priced menu.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return errors.unauthorized();
  if (user.mode !== "bartender") return errors.forbidden();

  const items = await prisma.barMenuItem.findMany({
    where: { userId: user.id },
    include: { cocktail: { select: { name: true, slug: true, imageUrl: true } } },
    orderBy: { createdAt: "desc" },
  });

  return ok(items.map((i) => ({ ...i, profit: i.price - i.cost })));
}

// POST /api/bar-menu  { cocktailId, price, cost, isActive }
// Upsert keyed on (user, cocktail): re-adding updates the price.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return errors.unauthorized();
  if (user.mode !== "bartender") return errors.forbidden();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errors.badRequest();
  }
  const parsed = barMenuSchema.safeParse(body);
  if (!parsed.success) return errors.badRequest(parsed.error.issues[0]?.message);
  const d = parsed.data;

  const item = await prisma.barMenuItem.upsert({
    where: {
      userId_cocktailId: { userId: user.id, cocktailId: d.cocktailId },
    },
    update: { price: d.price, cost: d.cost, isActive: d.isActive },
    create: {
      userId: user.id,
      cocktailId: d.cocktailId,
      price: d.price,
      cost: d.cost,
      isActive: d.isActive,
    },
    include: { cocktail: { select: { name: true } } },
  });

  return ok(item, undefined, 201);
}
