import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { ok, errors } from "@/lib/api";

// POST /api/auth/register
// Input:  { name, email, password, confirmPassword }
// Output: { data: { id, email } }
// Errors: 400 invalid body, 409 email already exists
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errors.badRequest("请求体不是合法 JSON");
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return errors.badRequest(parsed.error.issues[0]?.message ?? "参数有误");
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return errors.conflict("该邮箱已被注册");
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      password: hashed,
      role: "user",
      mode: "drinker",
    },
    select: { id: true, email: true },
  });

  return ok(user, undefined, 201);
}
