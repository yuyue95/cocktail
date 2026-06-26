import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api";
import { toCocktailDTO } from "@/lib/dto";

// GET /api/cocktails/random?category=&count=3
// Returns N random published cocktails (optionally within a category).
// Used by the home "换一组 / 随机喝一杯" actions.
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const category = sp.get("category") || undefined;
  const count = Math.min(10, Math.max(1, Number(sp.get("count")) || 3));

  const where = { isPublished: true, ...(category ? { category } : {}) };
  const ids = await prisma.cocktail.findMany({ where, select: { id: true } });
  if (ids.length === 0) return ok([]);

  // Shuffle ids and take N (fine for the dataset size of an MVP).
  const shuffled = [...ids].sort(() => Math.random() - 0.5).slice(0, count);
  const rows = await prisma.cocktail.findMany({
    where: { id: { in: shuffled.map((r) => r.id) } },
  });

  return ok(rows.map(toCocktailDTO));
}
