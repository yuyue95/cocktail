import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { ok, errors } from "@/lib/api";
import { adminIngredientSchema } from "@/lib/validations";

// POST /api/admin/ingredients — create a master ingredient.
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return errors.forbidden();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errors.badRequest();
  }
  const parsed = adminIngredientSchema.safeParse(body);
  if (!parsed.success) return errors.badRequest(parsed.error.issues[0]?.message);
  const d = parsed.data;

  const dupe = await prisma.ingredient.findUnique({ where: { name: d.name } });
  if (dupe) return errors.conflict("该材料已存在");

  const created = await prisma.ingredient.create({
    data: {
      name: d.name,
      nameEn: d.nameEn || null,
      type: d.type,
      description: d.description || null,
      abv: d.abv ?? null,
      imageUrl: d.imageUrl || null,
    },
  });
  return ok(created, undefined, 201);
}
