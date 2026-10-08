import ContentSiteShell from "@/components/content/ContentSiteShell";
import TechArchive from "@/components/content/TechArchive";
import { listEntries } from "@/lib/content/static";

export const metadata = { title: "技术学习记录 · 个人博客" };

export default function TechPage() {
  const entries = listEntries("article");
  return <ContentSiteShell path="/moments/tech/">
    <TechArchive entries={entries} />
  </ContentSiteShell>;
}
