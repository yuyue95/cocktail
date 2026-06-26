import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api";
import { toCocktailDTO } from "@/lib/dto";

// GET /api/cocktails?category=&flavor=&search=&page=&limit=
// Output: { data: CocktailDTO[], meta: { total, page, limit } }
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const category = sp.get("category") || undefined;
  const flavor = sp.get("flavor") || undefined;
  const search = sp.get("search") || undefined;
  const page = Math.max(1, Number(sp.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(sp.get("limit")) || 12));

  const where = {
    isPublished: true,
    ...(category ? { category } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search } },
            { nameEn: { contains: search } },
            { description: { contains: search } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.cocktail.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.cocktail.count({ where }),
  ]);

  // Flavor filtering happens after fetch because tags are stored as JSON.
  let dtos = rows.map(toCocktailDTO);
  if (flavor) {
    dtos = dtos.filter((c) => c.flavorTags.includes(flavor));
  }

  return ok(dtos, { total, page, limit });
}
