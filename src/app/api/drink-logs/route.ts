import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { ok, errors } from "@/lib/api";
import { drinkLogSchema } from "@/lib/validations";
import { stringifyStringArray, parseStringArray } from "@/lib/serialize";

// GET /api/drink-logs?year=&month=   (month is 1-12)
// Returns the current user's drink logs for a month, newest first.
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return errors.unauthorized();

  const sp = req.nextUrl.searchParams;
  const year = Number(sp.get("year"));
  const month = Number(sp.get("month"));

  const where: { userId: string; loggedAt?: { gte: Date; lt: Date } } = {
    userId: user.id,
  };
  if (year && month) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    where.loggedAt = { gte: start, lt: end };
  }

  const logs = await prisma.drinkLog.findMany({
    where,
    orderBy: { loggedAt: "desc" },
    include: { cocktail: { select: { name: true, slug: true, imageUrl: true } } },
  });

  return ok(
    logs.map((l) => ({ ...l, flavorTags: parseStringArray(l.flavorTags) }))
  );
}

// POST /api/drink-logs
// Input: drinkLogSchema. Either cocktailId or customName should identify the drink.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return errors.unauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errors.badRequest();
  }
  const parsed = drinkLogSchema.safeParse(body);
  if (!parsed.success) {
    return errors.badRequest(parsed.error.issues[0]?.message);
  }
  const d = parsed.data;
  if (!d.cocktailId && !d.customName) {
    return errors.badRequest("请选择配方或填写自创酒名");
  }

  const created = await prisma.drinkLog.create({
    data: {
      userId: user.id,
      cocktailId: d.cocktailId || null,
      customName: d.customName || null,
      loggedAt: new Date(d.loggedAt),
      rating: d.rating,
      flavorTags: stringifyStringArray(d.flavorTags),
      note: d.note || null,
      isHomemade: d.isHomemade,
    },
  });

  return ok(created, undefined, 201);
}
