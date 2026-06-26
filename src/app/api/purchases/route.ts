import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { ok, errors } from "@/lib/api";
import { purchaseSchema } from "@/lib/validations";

// GET /api/purchases  — the bartender's purchase (restock) history.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return errors.unauthorized();
  if (user.mode !== "bartender") return errors.forbidden();

  const records = await prisma.purchaseRecord.findMany({
    where: { userId: user.id },
    include: { ingredient: { select: { name: true } } },
    orderBy: { purchasedAt: "desc" },
  });
  return ok(records);
}

// POST /api/purchases  { ingredientId, quantity, unit, totalCost, purchasedAt, note? }
// Records a purchase AND increments the matching inventory item's quantity
// (creating the inventory row if it does not exist yet).
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
  const parsed = purchaseSchema.safeParse(body);
  if (!parsed.success) return errors.badRequest(parsed.error.issues[0]?.message);
  const d = parsed.data;
  const unitCost = d.quantity > 0 ? d.totalCost / d.quantity : 0;

  const [record] = await prisma.$transaction([
    prisma.purchaseRecord.create({
      data: {
        userId: user.id,
        ingredientId: d.ingredientId,
        quantity: d.quantity,
        unit: d.unit,
        totalCost: d.totalCost,
        purchasedAt: new Date(d.purchasedAt),
        note: d.note || null,
      },
    }),
    prisma.inventoryItem.upsert({
      where: {
        userId_ingredientId: { userId: user.id, ingredientId: d.ingredientId },
      },
      update: { quantity: { increment: d.quantity }, unit: d.unit, unitCost },
      create: {
        userId: user.id,
        ingredientId: d.ingredientId,
        quantity: d.quantity,
        unit: d.unit,
        unitCost,
      },
    }),
  ]);

  return ok(record, undefined, 201);
}
