const scope = "data-v-e13044d9";

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  node.setAttribute(scope, "");
  if (text) node.textContent = text;
  return node;
}

export function enhanceResume(root: HTMLElement): () => void {
  const page = root.querySelector<HTMLElement>(".resume-page");
  const timeline = page?.querySelector<HTMLElement>(".timeline");
  const sort = page?.querySelector<HTMLButtonElement>(".sort-toggle");
  if (!page || !timeline) return () => {};
  const timelineElement = timeline;

  const items = Array.from(timeline.querySelectorAll<HTMLElement>(":scope > .tl-item"));
  const originalSides = items.map(item => ({ left: item.classList.contains("tl-left"), right: item.classList.contains("tl-right") }));
  const modalButtons = Array.from(page.querySelectorAll<HTMLButtonElement>(".resume-view-btn"));
  let ascending = false;
  let mask: HTMLElement | null = null;
  let priorFocus: HTMLElement | null = null;
  const oldOverflow = document.body.style.overflow;

  function applyOrder() {
    const ordered = ascending ? [...items].reverse() : items;
    ordered.forEach((item, index) => {
      timelineElement.append(item);
      item.classList.toggle("tl-left", index % 2 === 0);
      item.classList.toggle("tl-right", index % 2 !== 0);
    });
    if (sort) {
      sort.querySelector<HTMLElement>(".sort-icon")!.textContent = ascending ? "⬆" : "⬇";
      sort.querySelector<HTMLElement>(".sort-label")!.textContent = ascending ? "正序" : "倒序";
      sort.title = ascending ? "当前：正序（最早优先），点击切换为倒序" : "当前：倒序（最新优先），点击切换为正序";
      sort.setAttribute("aria-pressed", String(ascending));
    }
  }

  const toggleSort = () => { ascending = !ascending; applyOrder(); };
  sort?.addEventListener("click", toggleSort);

  function close() {
    mask?.remove();
    mask = null;
    document.body.style.overflow = oldOverflow;
    priorFocus?.focus();
    priorFocus = null;
  }

  function open(card: HTMLElement) {
    close();
    priorFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const date = card.querySelector<HTMLElement>(".tl-card-date")?.textContent?.trim() || "";
    const title = card.querySelector<HTMLElement>(".tl-card-title")?.textContent?.trim() || "简历";
    const subtitle = card.querySelector<HTMLElement>(".tl-card-subtitle")?.textContent?.trim() || "";
    const description = card.querySelector<HTMLElement>(".tl-card-desc")?.textContent?.trim() || "";
    const tags = Array.from(card.querySelectorAll<HTMLElement>(".tl-tag"), node => node.textContent?.trim()).filter((tag): tag is string => Boolean(tag));
    const education = page?.querySelector<HTMLElement>(".hero-desc")?.textContent?.trim() || "";

    mask = element("div", "resume-modal-mask");
    const dialog = element("div", "resume-modal");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-label", title);

    const head = element("div", "resume-modal-head");
    const tag = element("div", "rm-tag");
    tag.append(element("span", "rm-tag-icon", "📄"));
    const tagText = element("div", "");
    tagText.append(element("span", "rm-tag-name", title), element("span", "rm-tag-date", date));
    tag.append(tagText);
    const closeButton = element("button", "rm-close-btn", "×");
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "关闭简历");
    closeButton.addEventListener("click", close);
    head.append(tag, closeButton);

    const body = element("div", "resume-modal-body");
    const header = element("div", "rm-header");
    header.append(element("h2", "", title));
    if (subtitle) header.append(element("p", "rm-target", subtitle));
    if (education) header.append(element("p", "rm-education", education));
    body.append(header);

    const section = element("section", "rm-section");
    section.append(element("h3", "rm-section-title", "版本摘要"));
    const entry = element("div", "rm-entry");
    const entryHead = element("div", "rm-entry-head");
    entryHead.append(element("span", "rm-entry-name", title), element("span", "rm-entry-period", date));
    entry.append(entryHead);
    if (description) entry.append(element("p", "", description));
    section.append(entry);
    body.append(section);

    if (tags.length) {
      const skills = element("section", "rm-section");
      skills.append(element("h3", "rm-section-title", "本版本关键词"));
      const chips = element("div", "rm-intro-chips");
      tags.forEach(value => chips.append(element("span", "rm-intro-chip", value)));
      skills.append(chips);
      body.append(skills);
    }
    dialog.append(head, body);
    mask.append(dialog);
    mask.addEventListener("click", event => { if (event.target === mask) close(); });
    document.body.append(mask);
    document.body.style.overflow = "hidden";
    closeButton.focus();
  }

  const handlers = modalButtons.map(button => {
    const click = () => {
      const card = button.closest<HTMLElement>(".resume-card");
      if (card) open(card);
    };
    button.addEventListener("click", click);
    return () => button.removeEventListener("click", click);
  });
  const keydown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && mask) close();
    if (event.key === "Tab" && mask) {
      event.preventDefault();
      mask.querySelector<HTMLButtonElement>(".rm-close-btn")?.focus();
    }
  };
  document.addEventListener("keydown", keydown);

  return () => {
    close();
    sort?.removeEventListener("click", toggleSort);
    handlers.forEach(cleanup => cleanup());
    document.removeEventListener("keydown", keydown);
    items.forEach((item, index) => {
      timelineElement.append(item);
      item.classList.toggle("tl-left", originalSides[index].left);
      item.classList.toggle("tl-right", originalSides[index].right);
    });
  };
}
