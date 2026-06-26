import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { ok, errors } from "@/lib/api";

// DELETE /api/user-ingredients/[ingredientId]
// Removes a material from the current user's bar.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { ingredientId: string } }
) {
  const user = await getCurrentUser();
  if (!user) return errors.unauthorized();

  const existing = await prisma.userIngredient.findUnique({
    where: {
      userId_ingredientId: {
        userId: user.id,
        ingredientId: params.ingredientId,
      },
    },
  });
  if (!existing) return errors.notFound("材料");

  await prisma.userIngredient.delete({ where: { id: existing.id } });
  return ok({ ingredientId: params.ingredientId });
}
