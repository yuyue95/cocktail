import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { prisma } from "@/lib/prisma";

async function getArticle(slug: string) {
  const a = await prisma.article.findUnique({ where: { slug } });
  if (!a || !a.isPublished) return null;
  return a;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const a = await getArticle(params.slug);
  return { title: a?.title ?? "文章未找到" };
}

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await getArticle(params.slug);
  if (!article) notFound();

  return (
    <main className="px-5 pt-6">
      <Link
        href="/knowledge"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
      </Link>

      <article className="prose-cocktail mt-5">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {article.content}
        </ReactMarkdown>
      </article>
    </main>
  );
}
