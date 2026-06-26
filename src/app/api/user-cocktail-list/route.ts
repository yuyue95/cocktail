import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { ok, errors } from "@/lib/api";
import { toCocktailDTO } from "@/lib/dto";

const LIST_TYPES = ["favorite", "want_to_make"];

// GET /api/user-cocktail-list?type=favorite|want_to_make
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return errors.unauthorized();

  const type = req.nextUrl.searchParams.get("type") || undefined;
  if (type && !LIST_TYPES.includes(type)) return errors.badRequest("无效的列表类型");

  const items = await prisma.userCocktailList.findMany({
    where: { userId: user.id, ...(type ? { listType: type } : {}) },
    include: { cocktail: true },
    orderBy: { createdAt: "desc" },
  });

  return ok(
    items.map((i) => ({
      id: i.id,
      listType: i.listType,
      cocktail: toCocktailDTO(i.cocktail),
    }))
  );
}

// POST /api/user-cocktail-list  { cocktailId, listType }
// Idempotent: re-adding an existing entry returns it without error.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return errors.unauthorized();

  let body: { cocktailId?: string; listType?: string };
  try {
    body = await req.json();
  } catch {
    return errors.badRequest();
  }
  if (!body.cocktailId || !body.listType || !LIST_TYPES.includes(body.listType)) {
    return errors.badRequest("参数有误");
  }

  const item = await prisma.userCocktailList.upsert({
    where: {
      userId_cocktailId_listType: {
        userId: user.id,
        cocktailId: body.cocktailId,
        listType: body.listType,
      },
    },
    update: {},
    create: { userId: user.id, cocktailId: body.cocktailId, listType: body.listType },
  });

  return ok(item, undefined, 201);
}

// DELETE /api/user-cocktail-list?cocktailId=&type=
export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return errors.unauthorized();

  const sp = req.nextUrl.searchParams;
  const cocktailId = sp.get("cocktailId");
  const listType = sp.get("type");
  if (!cocktailId || !listType) return errors.badRequest("参数有误");

  await prisma.userCocktailList.deleteMany({
    where: { userId: user.id, cocktailId, listType },
  });
  return ok({ cocktailId, listType });
}
