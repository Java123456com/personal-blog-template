import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageEnhancements from "@/components/sites/yihanglizi-cn-bc4c2f76/shared/PageEnhancements";

const site = "src/components/sites/yihanglizi-cn-bc4c2f76";
const pages: Record<string, string> = {
  "/blog/": "blog-68a120ac",
  "/moments/tech/": "moments-tech-e3a2705e",
  "/moments/life/": "moments-life-24139972",
  "/friends/": "friends-74954218",
  "/tools/": "tools-cc6427ba",
  "/about/": "about-4f10f17b",
  "/resume/": "resume-d4be9fa6",
};

function routeFor(slug: string[]) {
  const path = `/${slug.join("/")}`;
  return path.endsWith(".html") ? path : `${path}/`;
}

export function generateStaticParams() {
  return Object.keys(pages).map(path => ({ slug: path.replace(/^\/+|\/+$/g, "").split("/") }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const path = routeFor((await params).slug);
  const key = pages[path];
  if (!key) return {};
  const meta = JSON.parse(readFileSync(join(process.cwd(), site, key, "meta.json"), "utf8")) as { title: string };
  return { title: meta.title };
}

export default async function SitePage({ params }: { params: Promise<{ slug: string[] }> }) {
  const path = routeFor((await params).slug);
  const key = pages[path];
  if (!key) notFound();
  const markup = readFileSync(join(process.cwd(), site, key, "markup.html"), "utf8");
  return <><div id="app" dangerouslySetInnerHTML={{ __html: markup }} /><PageEnhancements path={path} /></>;
}
