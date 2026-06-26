import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { ok, errors } from "@/lib/api";

// PUT /api/bar-menu/[id]  { price?, cost?, isActive? }
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return errors.unauthorized();

  const item = await prisma.barMenuItem.findUnique({ where: { id: params.id } });
  if (!item) return errors.notFound("酒单项");
  if (item.userId !== user.id) return errors.forbidden();

  let body: { price?: number; cost?: number; isActive?: boolean };
  try {
    body = await req.json();
  } catch {
    return errors.badRequest();
  }

  const updated = await prisma.barMenuItem.update({
    where: { id: params.id },
    data: {
      ...(body.price !== undefined ? { price: body.price } : {}),
      ...(body.cost !== undefined ? { cost: body.cost } : {}),
      ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
    },
  });
  return ok(updated);
}

// DELETE /api/bar-menu/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return errors.unauthorized();

  const item = await prisma.barMenuItem.findUnique({ where: { id: params.id } });
  if (!item) return errors.notFound("酒单项");
  if (item.userId !== user.id) return errors.forbidden();

  await prisma.barMenuItem.delete({ where: { id: params.id } });
  return ok({ id: params.id });
}
