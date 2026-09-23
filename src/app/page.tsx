import { readFileSync } from "node:fs";
import { join } from "node:path";
import ClientEnhancements from "@/components/sites/yihanglizi-cn-bc4c2f76/root-8a5edab2/ClientEnhancements";

export default function Home() {
  const markup = readFileSync(
    join(process.cwd(), "src/components/sites/yihanglizi-cn-bc4c2f76/root-8a5edab2/markup.html"),
    "utf8",
  );
  const starMarkup = readFileSync(
    join(process.cwd(), "src/components/sites/yihanglizi-cn-bc4c2f76/root-8a5edab2/starry.html"),
    "utf8",
  );
  const orbitVideo = '<div class="slh-video-layer" aria-hidden="true"><video class="slh-video" autoplay muted loop playsinline preload="metadata"><source src="/media/starlight-orbit.mp4" type="video/mp4"></video></div>';
  const starHome = starMarkup.replace(/(<div[^>]*class="slh"[^>]*>)/, `$1${orbitVideo}`);
  const insertionPoint = "</footer></div><!----><!----><!----></div></div></div><!--[--><!--]--></div></div><footer";
  if (!markup.includes(insertionPoint)) throw new Error("Home theme insertion point is missing");
  const homeMarkup = markup.replace(insertionPoint, `</footer></div><!----><!----><!----></div>${starHome}</div></div><!--[--><!--]--></div></div><footer`);
  return <><div id="app" dangerouslySetInnerHTML={{ __html: homeMarkup }} /><ClientEnhancements starMarkup={starMarkup} /></>;
}
