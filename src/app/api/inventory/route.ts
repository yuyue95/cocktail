import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { ok, errors } from "@/lib/api";
import { inventorySchema } from "@/lib/validations";

// GET /api/inventory
// Returns the bartender's stock list, each item flagged when below threshold.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return errors.unauthorized();
  if (user.mode !== "bartender") return errors.forbidden();

  const items = await prisma.inventoryItem.findMany({
    where: { userId: user.id },
    include: { ingredient: true },
    orderBy: { updatedAt: "desc" },
  });

  return ok(
    items.map((i) => ({
      ...i,
      isLow: i.lowStockThreshold > 0 && i.quantity <= i.lowStockThreshold,
    }))
  );
}

// POST /api/inventory  { ingredientId, quantity, unit, lowStockThreshold, unitCost }
// Upserts: adding an ingredient that already exists updates its stock instead.
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
  const parsed = inventorySchema.safeParse(body);
  if (!parsed.success) return errors.badRequest(parsed.error.issues[0]?.message);
  const d = parsed.data;

  const item = await prisma.inventoryItem.upsert({
    where: {
      userId_ingredientId: { userId: user.id, ingredientId: d.ingredientId },
    },
    update: {
      quantity: d.quantity,
      unit: d.unit,
      lowStockThreshold: d.lowStockThreshold,
      unitCost: d.unitCost,
    },
    create: {
      userId: user.id,
      ingredientId: d.ingredientId,
      quantity: d.quantity,
      unit: d.unit,
      lowStockThreshold: d.lowStockThreshold,
      unitCost: d.unitCost,
    },
    include: { ingredient: true },
  });

  return ok(item, undefined, 201);
}
