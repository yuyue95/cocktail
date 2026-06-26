import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { ok, errors } from "@/lib/api";
import { adminArticleSchema } from "@/lib/validations";

// PUT /api/admin/articles/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin();
  if (!admin) return errors.forbidden();

  const existing = await prisma.article.findUnique({ where: { id: params.id } });
  if (!existing) return errors.notFound("文章");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errors.badRequest();
  }
  const parsed = adminArticleSchema.safeParse(body);
  if (!parsed.success) return errors.badRequest(parsed.error.issues[0]?.message);
  const d = parsed.data;

  const updated = await prisma.article.update({
    where: { id: params.id },
    data: {
      title: d.title,
      slug: d.slug,
      content: d.content,
      category: d.category || null,
      coverUrl: d.coverUrl || null,
      isPublished: d.isPublished,
    },
  });
  return ok(updated);
}

// DELETE /api/admin/articles/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin();
  if (!admin) return errors.forbidden();

  const existing = await prisma.article.findUnique({ where: { id: params.id } });
  if (!existing) return errors.notFound("文章");

  await prisma.article.delete({ where: { id: params.id } });
  return ok({ id: params.id });
}
