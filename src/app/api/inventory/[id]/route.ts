import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { ok, errors } from "@/lib/api";

// PUT /api/inventory/[id]  { quantity?, unitCost?, lowStockThreshold? }
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return errors.unauthorized();

  const item = await prisma.inventoryItem.findUnique({ where: { id: params.id } });
  if (!item) return errors.notFound("库存项");
  if (item.userId !== user.id) return errors.forbidden();

  let body: { quantity?: number; unitCost?: number; lowStockThreshold?: number };
  try {
    body = await req.json();
  } catch {
    return errors.badRequest();
  }

  const updated = await prisma.inventoryItem.update({
    where: { id: params.id },
    data: {
      ...(body.quantity !== undefined ? { quantity: body.quantity } : {}),
      ...(body.unitCost !== undefined ? { unitCost: body.unitCost } : {}),
      ...(body.lowStockThreshold !== undefined
        ? { lowStockThreshold: body.lowStockThreshold }
        : {}),
    },
    include: { ingredient: true },
  });
  return ok(updated);
}

// DELETE /api/inventory/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return errors.unauthorized();

  const item = await prisma.inventoryItem.findUnique({ where: { id: params.id } });
  if (!item) return errors.notFound("库存项");
  if (item.userId !== user.id) return errors.forbidden();

  await prisma.inventoryItem.delete({ where: { id: params.id } });
  return ok({ id: params.id });
}
