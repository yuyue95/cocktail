import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { ok, errors } from "@/lib/api";

// DELETE /api/business-logs/[id]  (cascades to its sales)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return errors.unauthorized();

  const log = await prisma.businessLog.findUnique({ where: { id: params.id } });
  if (!log) return errors.notFound("营业记录");
  if (log.userId !== user.id) return errors.forbidden();

  await prisma.businessLog.delete({ where: { id: params.id } });
  return ok({ id: params.id });
}
