import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ArticleForm from "@/components/admin/ArticleForm";

export default async function EditArticlePage({
  params,
}: {
  params: { id: string };
}) {
  const a = await prisma.article.findUnique({ where: { id: params.id } });
  if (!a) notFound();

  return (
    <ArticleForm
      initial={{
        id: a.id,
        title: a.title,
        slug: a.slug,
        content: a.content,
        category: a.category ?? "",
        isPublished: a.isPublished,
      }}
    />
  );
}
