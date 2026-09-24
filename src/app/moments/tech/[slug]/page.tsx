import { notFound } from "next/navigation";
import ContentSiteShell from "@/components/content/ContentSiteShell";
import ArticleReader from "@/components/content/ArticleReader";
import { getPublishedArticle } from "@/lib/content/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const article = await getPublishedArticle((await params).slug).catch(() => null);
  return { title: article ? `${article.title} · 技术学习记录` : "文章 · 个人博客" };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const article = await getPublishedArticle(slug).catch(() => null);
  if (!article) notFound();
  return <ContentSiteShell path={`/moments/tech/${slug}/`}><ArticleReader entry={article} /></ContentSiteShell>;
}
