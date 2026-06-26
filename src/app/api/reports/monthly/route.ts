import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { ok, errors } from "@/lib/api";

// GET /api/reports/monthly?year=&month=
// Aggregates sales for the month: total revenue, total cups, and a
// best-seller ranking. Used by the bartender calendar overview.
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return errors.unauthorized();
  if (user.mode !== "bartender") return errors.forbidden();

  const sp = req.nextUrl.searchParams;
  const now = new Date();
  const year = Number(sp.get("year")) || now.getFullYear();
  const month = Number(sp.get("month")) || now.getMonth() + 1;

  const logs = await prisma.businessLog.findMany({
    where: {
      userId: user.id,
      loggedDate: {
        gte: new Date(year, month - 1, 1),
        lt: new Date(year, month, 1),
      },
    },
    include: { sales: { include: { cocktail: { select: { name: true } } } } },
  });

  let totalRevenue = 0;
  let totalCups = 0;
  const ranking = new Map<string, { name: string; cups: number; revenue: number }>();

  for (const log of logs) {
    for (const s of log.sales) {
      const revenue = s.quantity * s.unitPrice;
      totalRevenue += revenue;
      totalCups += s.quantity;
      const name = s.cocktail?.name ?? "其他";
      const cur = ranking.get(name) ?? { name, cups: 0, revenue: 0 };
      cur.cups += s.quantity;
      cur.revenue += revenue;
      ranking.set(name, cur);
    }
  }

  const bestSellers = Array.from(ranking.values()).sort(
    (a, b) => b.cups - a.cups
  );

  return ok({
    year,
    month,
    totalRevenue,
    totalCups,
    daysWithSales: logs.length,
    bestSellers,
  });
}
