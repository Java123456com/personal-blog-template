import ContentSiteShell from "@/components/content/ContentSiteShell";
import ContentEditor from "@/components/content/ContentEditor";

export const metadata = { title: "记录 · 个人博客" };

export default function WritePage() {
  return <ContentSiteShell path="/write/"><ContentEditor /></ContentSiteShell>;
}
