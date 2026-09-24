import ContentSiteShell from "@/components/content/ContentSiteShell";
import TechArchive from "@/components/content/TechArchive";
import { listEntries } from "@/lib/content/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "技术学习记录 · 个人博客" };

export default async function TechPage() {
  let entries: Awaited<ReturnType<typeof listEntries>> = [];
  let error = false;
  try { entries = await listEntries("article"); } catch { error = true; }
  return <ContentSiteShell path="/moments/tech/">
    {error && <div className="content-db-notice" role="alert">内容暂时无法读取，请检查 MySQL 配置与连接。</div>}
    <TechArchive entries={entries} />
  </ContentSiteShell>;
}
