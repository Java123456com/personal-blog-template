import ContentSiteShell from "@/components/content/ContentSiteShell";
import { LifeTimeline } from "@/components/content/LifeTimeline";
import { listEntries } from "@/lib/content/static";

export const metadata = { title: "日常生活记录 · 个人博客" };

export default function LifePage() {
  const entries = listEntries("moment");
  return <ContentSiteShell path="/moments/life/">
    <LifeTimeline entries={entries} />
  </ContentSiteShell>;
}
