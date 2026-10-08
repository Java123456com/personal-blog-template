import { notFound } from "next/navigation";
import ContentSiteShell from "@/components/content/ContentSiteShell";
import ArticleReader from "@/components/content/ArticleReader";
import { getPublishedArticle, listEntries } from "@/lib/content/static";

export const dynamicParams = false;

export function generateStaticParams() {
  const articles = listEntries("article");
  // Reserve a not-found parameter so an empty archive can also be exported.
  return articles.length ? articles.map(({ slug }) => ({ slug })) : [{ slug: "__empty" }];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const article = getPublishedArticle((await params).slug);
  return { title: article ? `${article.title} · 技术学习记录` : "文章 · 个人博客" };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const article = getPublishedArticle(slug);
  if (!article) notFound();
  return <ContentSiteShell path={`/moments/tech/${slug}/`}><ArticleReader entry={article} /></ContentSiteShell>;
}
