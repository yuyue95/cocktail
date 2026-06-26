import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api";

// GET /api/ingredients?type=&search=
// Public list used by selectors (add material, recipe builder, etc.).
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const type = sp.get("type") || undefined;
  const search = sp.get("search") || undefined;

  const ingredients = await prisma.ingredient.findMany({
    where: {
      ...(type ? { type } : {}),
      ...(search
        ? { OR: [{ name: { contains: search } }, { nameEn: { contains: search } }] }
        : {}),
    },
    orderBy: { name: "asc" },
  });

  return ok(ingredients);
}
