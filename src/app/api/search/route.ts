import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, errors } from "@/lib/api";
import { toCocktailDTO } from "@/lib/dto";

// GET /api/search?q=&type=cocktail|article|all
// Output: { data: { cocktails, articles } }
// Errors: 400 when q is empty
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = (sp.get("q") || "").trim();
  const type = sp.get("type") || "all";

  if (!q) return errors.badRequest("请输入搜索关键词");

  const wantCocktails = type === "all" || type === "cocktail";
  const wantArticles = type === "all" || type === "article";

  // Search cocktails by name/nameEn and by linked ingredient name.
  const cocktails = wantCocktails
    ? await prisma.cocktail.findMany({
        where: {
          isPublished: true,
          OR: [
            { name: { contains: q } },
            { nameEn: { contains: q } },
            { description: { contains: q } },
            {
              ingredients: {
                some: {
                  ingredient: {
                    OR: [{ name: { contains: q } }, { nameEn: { contains: q } }],
                  },
                },
              },
            },
          ],
        },
        take: 30,
      })
    : [];

  const articles = wantArticles
    ? await prisma.article.findMany({
        where: {
          isPublished: true,
          OR: [{ title: { contains: q } }, { content: { contains: q } }],
        },
        select: { id: true, title: true, slug: true, category: true },
        take: 20,
      })
    : [];

  return ok({ cocktails: cocktails.map(toCocktailDTO), articles });
}
