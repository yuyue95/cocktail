import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { ok, errors } from "@/lib/api";
import { businessLogSchema } from "@/lib/validations";

// GET /api/business-logs?year=&month=
// Returns the user's daily business records (with sales) for a month.
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return errors.unauthorized();
  if (user.mode !== "bartender") return errors.forbidden();

  const sp = req.nextUrl.searchParams;
  const year = Number(sp.get("year"));
  const month = Number(sp.get("month"));

  const where: { userId: string; loggedDate?: { gte: Date; lt: Date } } = {
    userId: user.id,
  };
  if (year && month) {
    where.loggedDate = {
      gte: new Date(year, month - 1, 1),
      lt: new Date(year, month, 1),
    };
  }

  const logs = await prisma.businessLog.findMany({
    where,
    orderBy: { loggedDate: "desc" },
    include: {
      sales: { include: { cocktail: { select: { name: true } } } },
    },
  });

  // Attach a computed daily total for convenience.
  const withTotals = logs.map((l) => ({
    ...l,
    total: l.sales.reduce((sum, s) => sum + s.quantity * s.unitPrice, 0),
  }));

  return ok(withTotals);
}

// POST /api/business-logs  { loggedDate, note?, sales: [{cocktailId?, quantity, unitPrice}] }
// Creates a daily record and its sales rows in one transaction.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return errors.unauthorized();
  if (user.mode !== "bartender") return errors.forbidden();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errors.badRequest();
  }
  const parsed = businessLogSchema.safeParse(body);
  if (!parsed.success) return errors.badRequest(parsed.error.issues[0]?.message);
  const d = parsed.data;

  const created = await prisma.businessLog.create({
    data: {
      userId: user.id,
      loggedDate: new Date(d.loggedDate),
      note: d.note || null,
      sales: {
        create: d.sales.map((s) => ({
          cocktailId: s.cocktailId || null,
          quantity: s.quantity,
          unitPrice: s.unitPrice,
        })),
      },
    },
    include: { sales: true },
  });

  return ok(created, undefined, 201);
}
