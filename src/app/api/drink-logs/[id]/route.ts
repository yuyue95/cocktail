import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { ok, errors } from "@/lib/api";
import { drinkLogSchema } from "@/lib/validations";
import { stringifyStringArray } from "@/lib/serialize";

// Ownership guard shared by PUT/DELETE.
async function ownedLog(userId: string, id: string) {
  const log = await prisma.drinkLog.findUnique({ where: { id } });
  if (!log) return { error: "notFound" as const };
  if (log.userId !== userId) return { error: "forbidden" as const };
  return { log };
}

// PUT /api/drink-logs/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return errors.unauthorized();

  const guard = await ownedLog(user.id, params.id);
  if (guard.error === "notFound") return errors.notFound("记录");
  if (guard.error === "forbidden") return errors.forbidden();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errors.badRequest();
  }
  const parsed = drinkLogSchema.safeParse(body);
  if (!parsed.success) return errors.badRequest(parsed.error.issues[0]?.message);
  const d = parsed.data;

  const updated = await prisma.drinkLog.update({
    where: { id: params.id },
    data: {
      cocktailId: d.cocktailId || null,
      customName: d.customName || null,
      loggedAt: new Date(d.loggedAt),
      rating: d.rating,
      flavorTags: stringifyStringArray(d.flavorTags),
      note: d.note || null,
      isHomemade: d.isHomemade,
    },
  });
  return ok(updated);
}

// DELETE /api/drink-logs/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return errors.unauthorized();

  const guard = await ownedLog(user.id, params.id);
  if (guard.error === "notFound") return errors.notFound("记录");
  if (guard.error === "forbidden") return errors.forbidden();

  await prisma.drinkLog.delete({ where: { id: params.id } });
  return ok({ id: params.id });
}
