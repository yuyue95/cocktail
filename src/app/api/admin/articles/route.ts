import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { ok, errors } from "@/lib/api";
import { adminArticleSchema } from "@/lib/validations";

// GET /api/admin/articles — list (incl. drafts) for the admin table.
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return errors.forbidden();

  const rows = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, slug: true, category: true, isPublished: true },
  });
  return ok(rows);
}

// POST /api/admin/articles
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return errors.forbidden();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errors.badRequest();
  }
  const parsed = adminArticleSchema.safeParse(body);
  if (!parsed.success) return errors.badRequest(parsed.error.issues[0]?.message);
  const d = parsed.data;

  const dupe = await prisma.article.findUnique({ where: { slug: d.slug } });
  if (dupe) return errors.conflict("slug 已存在");

  const created = await prisma.article.create({
    data: {
      title: d.title,
      slug: d.slug,
      content: d.content,
      category: d.category || null,
      coverUrl: d.coverUrl || null,
      isPublished: d.isPublished,
    },
  });
  return ok(created, undefined, 201);
}
