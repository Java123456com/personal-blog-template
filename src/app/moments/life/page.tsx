import ContentSiteShell from "@/components/content/ContentSiteShell";
import { LifeTimeline } from "@/components/content/LifeTimeline";
import { listEntries } from "@/lib/content/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "日常生活记录 · 个人博客" };

export default async function LifePage() {
  let entries: Awaited<ReturnType<typeof listEntries>> = [];
  let error = false;
  try { entries = await listEntries("moment"); } catch { error = true; }
  return <ContentSiteShell path="/moments/life/">
    {error && <div className="content-db-notice" role="alert">内容暂时无法读取，请检查 MySQL 配置与连接。</div>}
    <LifeTimeline entries={entries} />
  </ContentSiteShell>;
}
