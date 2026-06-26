import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { ok, errors } from "@/lib/api";
import { USER_MODES } from "@/lib/constants";

// PUT /api/user/mode
// Input:  { mode: 'drinker' | 'bartender' }
// Output: { data: { mode } }
// Errors: 401 not logged in, 400 invalid mode
export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return errors.unauthorized();

  let body: { mode?: string };
  try {
    body = await req.json();
  } catch {
    return errors.badRequest();
  }

  const validModes = Object.values(USER_MODES) as string[];
  if (!body.mode || !validModes.includes(body.mode)) {
    return errors.badRequest("无效的身份模式");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { mode: body.mode },
  });

  return ok({ mode: body.mode });
}
