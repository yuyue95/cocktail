import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { ok, errors } from "@/lib/api";
import { adminIngredientSchema } from "@/lib/validations";

// PUT /api/admin/ingredients/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin();
  if (!admin) return errors.forbidden();

  const existing = await prisma.ingredient.findUnique({ where: { id: params.id } });
  if (!existing) return errors.notFound("材料");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errors.badRequest();
  }
  const parsed = adminIngredientSchema.safeParse(body);
  if (!parsed.success) return errors.badRequest(parsed.error.issues[0]?.message);
  const d = parsed.data;

  const updated = await prisma.ingredient.update({
    where: { id: params.id },
    data: {
      name: d.name,
      nameEn: d.nameEn || null,
      type: d.type,
      description: d.description || null,
      abv: d.abv ?? null,
      imageUrl: d.imageUrl || null,
    },
  });
  return ok(updated);
}

// DELETE /api/admin/ingredients/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin();
  if (!admin) return errors.forbidden();

  const existing = await prisma.ingredient.findUnique({ where: { id: params.id } });
  if (!existing) return errors.notFound("材料");

  await prisma.ingredient.delete({ where: { id: params.id } });
  return ok({ id: params.id });
}
