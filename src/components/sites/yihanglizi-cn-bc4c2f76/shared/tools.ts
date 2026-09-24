import sourceTools from "./tools-data.json";

type Tool = (typeof sourceTools)[number];
type IconName = Tool["features"][number]["icon"] | Tool["runtime"][number]["icon"] |
  "apple" | "smartphone" | "arrow-left" | "arrow-right" | "download" | "external" |
  "check" | "alert" | "play" | "globe";

const scope = "data-v-2a393b97";
const assetRoot = "/sites/yihanglizi-cn-bc4c2f76/shared/tools-app/assets/";
const tools = [...sourceTools].reverse();

const icons: Partial<Record<IconName, string>> = {
  monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
  terminal: '<path d="M4 17l6-6-6-6M12 19h8"/>',
  plugin: '<path d="M10 3a2 2 0 0 1 4 0v1h2a2 2 0 0 1 2 2v2h1a2 2 0 0 1 0 4h-1v2a2 2 0 0 1-2 2h-2v1a2 2 0 0 1-4 0v-1H8a2 2 0 0 1-2-2v-2H5a2 2 0 0 1 0-4h1V6a2 2 0 0 1 2-2h2z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  apple: '<path d="M12 20c-4 0-6-2-6-5 0-2 1-4 3-4 1 0 2 1 3 1s2-1 3-1c2 0 3 2 3 4 0 3-2 5-6 5z"/><path d="M12 20v1"/>',
  smartphone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12z"/>',
  sparkles: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  files: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
  bot: '<rect x="4" y="8" width="16" height="11" rx="2"/><path d="M12 8V5M9 3h6"/><circle cx="9" cy="13" r="1"/><circle cx="15" cy="13" r="1"/><path d="M2 12h2M20 12h2"/>',
  "layout-dashboard": '<rect x="3" y="3" width="8" height="9" rx="1"/><rect x="3" y="15" width="8" height="6" rx="1"/><rect x="14" y="3" width="7" height="6" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/><path d="M16 5a3 3 0 0 1 0 6M21 20c0-2-1-4-3-4.5"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.6 14H3a2 2 0 0 1 0-4h.1A1.6 1.6 0 0 0 4.6 7a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 9 3.6V3a2 2 0 0 1 4 0v.1A1.6 1.6 0 0 0 15 4.6a1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.6 1.6 0 0 0 19.4 9h.1a2 2 0 0 1 0 4h-.1z"/>',
  cpu: '<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
  shield: '<path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  workflow: '<rect x="3" y="3" width="6" height="6" rx="1"/><circle cx="18" cy="6" r="2"/><path d="M9 6h7M6 9v6a3 3 0 0 0 3 3h6"/>',
  "file-check": '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7"/><path d="M14 3v5h5"/><path d="M16 14l2 2 4-4"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  code: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 4l-4 16"/>',
  brain: '<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 0V4z"/><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 0"/>',
  languages: '<path d="M5 8h6M8 5v3M5 8c0 4 2 7 7 8M11 12c0 4-1 8-6 10M13 19l4-9 4 9M14 16h6"/>',
  "git-branch": '<circle cx="6" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="9" r="2"/><path d="M6 8v8M6 12a6 6 0 0 0 6-6h4"/>',
  wrench: '<path d="M14.7 6.3a4 4 0 0 0-5-5l2.2 2.2-2.8 2.8-2.2-2.2a4 4 0 0 0 5 5L20 17.2 17.2 20z"/>',
  "arrow-left": '<path d="M19 12H5M12 19l-7-7 7-7"/>',
  "arrow-right": '<path d="M5 12h14M12 5l7 7-7 7"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  alert: '<path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17h.01"/>',
  play: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5l5 3.5-5 3.5z"/>',
};

function esc(value: unknown): string {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
}

function svg(name: IconName): string {
  return `<svg viewBox="0 0 24 24" class="ic" ${scope}>${icons[name] ?? icons.sparkles}</svg>`;
}

function logo(tool: Tool, large = false): string {
  return `<div class="logo${large ? " lg" : ""}" ${scope}><img src="${assetRoot}${esc(tool.icon)}" alt="${esc(tool.name)}" loading="lazy" ${scope}></div>`;
}

function renderList(): string {
  return `<section ${scope}>
    <header class="hero" ${scope}>
      <div class="hero-badge" ${scope}>国产 AI 编程工具</div>
      <h1 class="hero-title" ${scope}>国产 AI 编程 Agent 薅羊毛指南</h1>
      <p class="hero-sub" ${scope}>一站式盘点当下最热门的国产 AI 编程助手，逐个对比能力边界、运行形态与下载方式，帮你找到最顺手的那一个。</p>
      <div class="hero-meta" ${scope}><span ${scope}><b ${scope}>${tools.length}</b> 款精选工具</span><span class="dot" ${scope}></span><span ${scope}>GUI / CLI / IDE 全覆盖</span><span class="dot" ${scope}></span><span ${scope}>持续更新</span></div>
    </header>
    <div class="grid" ${scope}>${tools.map((tool, index) => `<article class="card" tabindex="0" role="button" data-tool-index="${index}" style="--accent:${tool.accent};--accent-soft:${tool.accentSoft};" ${scope}>
      <div class="card-glow" ${scope}></div><div class="card-head" ${scope}>${logo(tool)}<div class="card-titles" ${scope}><h3 ${scope}>${esc(tool.name)}</h3><p ${scope}>${esc(tool.company)}</p></div></div>
      <p class="card-desc" ${scope}>${esc(tool.description)}</p><div class="card-foot" ${scope}>${tool.badges.map(badge => `<span class="tag" ${scope}>${esc(badge)}</span>`).join("")}<span class="more" ${scope}>查看详情 →</span></div>
    </article>`).join("")}</div>
  </section>`;
}

function platformIcon(os: string): IconName {
  if (os === "Windows") return "monitor";
  if (os === "macOS") return "apple";
  if (os === "Linux") return "terminal";
  if (os === "Web") return "globe";
  return "smartphone";
}

function renderDetail(tool: Tool, index: number): string {
  return `<section class="detail" ${scope}>
    <button class="back" type="button" data-tools-back ${scope}>${svg("arrow-left")}<span ${scope}>返回工具列表</span></button>
    <header class="d-hero" style="--accent:${tool.accent};--accent-soft:${tool.accentSoft};" ${scope}>
      <div class="d-head" ${scope}>${logo(tool, true)}<div ${scope}><div class="d-tags" ${scope}>${tool.badges.map(badge => `<span class="tag" ${scope}>${esc(badge)}</span>`).join("")}</div><h1 ${scope}>${esc(tool.name)}</h1><p class="d-company" ${scope}><span class="co-label" ${scope}>厂商</span>${esc(tool.company)}</p></div></div>
      <p class="d-desc" ${scope}>${esc(tool.description)}</p>
      <div class="stats" ${scope}>${tool.quickStats.map(stat => `<div class="stat" ${scope}><b ${scope}>${esc(stat.value)}</b><span ${scope}>${esc(stat.label)}</span></div>`).join("")}</div>
      <div class="showcase" ${scope}><img src="${assetRoot}${esc(tool.showcase)}" alt="${esc(tool.name)} 界面预览" ${scope}></div>
    </header>
    <div class="d-section" ${scope}><h2 ${scope}>${svg("download")} 获取方式</h2><div class="dl-card" ${scope}><div class="dl-urls" ${scope}><span class="dl-label" ${scope}>官方地址</span>${tool.downloadUrls.map(url => `<a href="https://${esc(url.replace(/^https?:\/\//, ""))}" target="_blank" rel="noopener noreferrer" class="url-chip" ${scope}>${svg("external")}${esc(url)}</a>`).join("")}</div><a class="cta" href="${esc(tool.ctaUrl)}" target="_blank" rel="noopener noreferrer" ${scope}>${svg("download")} ${esc(tool.ctaText)}</a></div><div class="platforms" ${scope}><span class="dl-label" ${scope}>支持平台</span>${tool.platforms.map(platform => `<span class="plat" ${scope}>${svg(platformIcon(platform.os))}${esc(platform.label)}</span>`).join("")}</div></div>
    <div class="d-section" ${scope}><h2 ${scope}>${svg("cpu")} 运行形态</h2><div class="runtime" ${scope}>${tool.runtime.map(item => `<div class="rt ${item.level}" ${scope}><div class="rt-ic" ${scope}>${svg(item.icon)}</div><div class="rt-body" ${scope}><div class="rt-top" ${scope}><h4 ${scope}>${esc(item.title)}</h4><span class="rt-level ${item.level}" ${scope}>${svg(item.level === "full" ? "check" : "alert")} ${item.level === "full" ? "完整支持" : "部分支持"}</span></div><p class="rt-sub" ${scope}>${esc(item.subtitle)}</p><p class="rt-desc" ${scope}>${esc(item.desc)}</p></div></div>`).join("")}</div></div>
    <div class="d-section" ${scope}><h2 ${scope}>${svg("sparkles")} 核心能力</h2><div class="features" ${scope}>${tool.features.map(feature => `<div class="feat" ${scope}><div class="feat-ic" ${scope}>${svg(feature.icon)}</div><h4 ${scope}>${esc(feature.title)}</h4><p ${scope}>${esc(feature.desc)}</p></div>`).join("")}</div></div>
    <nav class="pager" aria-label="工具详情翻页" ${scope}><button type="button" data-tools-page="${(index - 1 + tools.length) % tools.length}" ${scope}>${svg("arrow-left")}<span ${scope}>上一个</span></button><button type="button" data-tools-page="${(index + 1) % tools.length}" ${scope}><span ${scope}>下一个</span>${svg("arrow-right")}</button></nav>
  </section>`;
}

export function enhanceTools(root: HTMLElement): () => void {
  const host = root.querySelector<HTMLElement>(".tools-root");
  if (!host) return () => {};
  let selected = -1;

  const showList = () => {
    selected = -1;
    host.innerHTML = renderList();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const showDetail = (index: number) => {
    selected = (index + tools.length) % tools.length;
    host.innerHTML = renderDetail(tools[selected], selected);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const onClick = (event: Event) => {
    const target = event.target as Element;
    const card = target.closest<HTMLElement>("[data-tool-index]");
    if (card) return showDetail(Number(card.dataset.toolIndex));
    if (target.closest("[data-tools-back]")) return showList();
    const pager = target.closest<HTMLElement>("[data-tools-page]");
    if (pager) showDetail(Number(pager.dataset.toolsPage));
  };
  const onKeyDown = (event: KeyboardEvent) => {
    const card = (event.target as Element).closest<HTMLElement>("[data-tool-index]");
    if (card && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      showDetail(Number(card.dataset.toolIndex));
    } else if (selected >= 0 && event.key === "Escape") showList();
  };

  host.addEventListener("click", onClick);
  host.addEventListener("keydown", onKeyDown);
  showList();
  return () => {
    host.removeEventListener("click", onClick);
    host.removeEventListener("keydown", onKeyDown);
  };
}
