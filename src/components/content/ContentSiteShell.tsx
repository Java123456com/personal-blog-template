import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ReactNode } from "react";
import PageEnhancements from "@/components/sites/yihanglizi-cn-bc4c2f76/shared/PageEnhancements";

const source = join(process.cwd(), "src/components/sites/yihanglizi-cn-bc4c2f76/moments-tech-e3a2705e/markup.html");
const markup = readFileSync(source, "utf8");
const navMarkup = markup.match(/<header class="VPNav"[\s\S]*?<\/header>/)?.[0] ?? "";

if (!navMarkup) throw new Error("Could not find the shared site navigation.");

export default function ContentSiteShell({ path, children }: { path: string; children: ReactNode }) {
  return <>
    <div id="app">
      <div className="Layout content-site-shell" data-v-5d98c3a5="">
        <div data-v-5dc8c522="" className="doc-bg starry-theme bg-ready" aria-hidden="true">
          <canvas data-v-5dc8c522="" className="bg-canvas active" />
          <div data-v-5dc8c522="" className="bg-overlay" />
          <div data-v-5dc8c522="" className="scanlines" />
          <div data-v-5dc8c522="" className="nebula active" />
        </div>
        <a href="#VPContent" className="VPSkipLink visually-hidden">Skip to content</a>
        <div className="content-site-shell__nav" dangerouslySetInnerHTML={{ __html: navMarkup }} />
        <div className="VPContent" id="VPContent">{children}</div>
      </div>
    </div>
    <PageEnhancements path={path} managed />
  </>;
}
