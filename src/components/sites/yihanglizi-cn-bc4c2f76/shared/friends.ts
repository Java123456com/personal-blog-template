function friendUrl(card: HTMLElement): string | null {
  const raw = card.querySelector<HTMLElement>(".friend-url-text")?.textContent?.trim();
  if (!raw) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export function enhanceFriends(root: HTMLElement): () => void {
  const page = root.querySelector<HTMLElement>(".friends-page");
  if (!page) return () => {};

  const buttons = Array.from(page.querySelectorAll<HTMLButtonElement>(".view-btn"));
  const grid = page.querySelector<HTMLElement>(".friends-grid");
  const mapWrap = page.querySelector<HTMLElement>(".starmap-wrap");
  const map = page.querySelector<HTMLElement>(".starmap");
  const canvas = page.querySelector<HTMLCanvasElement>(".starmap-canvas");
  const thumb = page.querySelector<HTMLElement>(".view-switch-thumb");
  const cards = Array.from(page.querySelectorAll<HTMLButtonElement>(".friend-card"));
  const nodes = Array.from(page.querySelectorAll<HTMLElement>(".sm-node-friend"));
  const copies = Array.from(page.querySelectorAll<HTMLButtonElement>(".apply-copy"));
  const cleanups: Array<() => void> = [];
  const timers = new Set<number>();
  let starView = false;
  let frame = 0;

  function drawMap() {
    if (!map || !canvas || !starView) return;
    const width = map.clientWidth;
    const height = map.clientHeight;
    if (!width || !height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    const cx = width / 2;
    const cy = height / 2;
    const radiusX = Math.max(85, Math.min(width * .37, 310));
    const radiusY = Math.max(85, Math.min(height * .34, 190));
    const points = nodes.map((node, index) => {
      const angle = -Math.PI / 2 + index * (Math.PI * 2 / Math.max(nodes.length, 1));
      const x = cx + Math.cos(angle) * radiusX;
      const y = cy + Math.sin(angle) * radiusY;
      node.style.left = `${x}px`;
      node.style.top = `${y}px`;
      return { x, y };
    });
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(34, 211, 238, .35)";
    points.forEach(({ x, y }) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.stroke();
    });
    ctx.strokeStyle = "rgba(34, 211, 238, .13)";
    ctx.beginPath();
    points.forEach(({ x, y }, index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.closePath();
    ctx.stroke();
  }

  function setView(next: boolean) {
    starView = next;
    if (grid) grid.style.display = next ? "none" : "";
    if (mapWrap) mapWrap.style.display = next ? "" : "none";
    buttons.forEach((button, index) => {
      const active = index === (next ? 1 : 0);
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });
    thumb?.classList.toggle("is-grid", !next);
    thumb?.classList.toggle("is-starmap", next);
    cancelAnimationFrame(frame);
    if (next) frame = requestAnimationFrame(drawMap);
  }

  buttons.forEach((button, index) => {
    const click = () => setView(index === 1);
    button.addEventListener("click", click);
    cleanups.push(() => button.removeEventListener("click", click));
  });

  cards.forEach((card, index) => {
    const url = friendUrl(card);
    if (!url) return;
    const open = () => window.open(url, "_blank", "noopener,noreferrer");
    card.addEventListener("click", open);
    cleanups.push(() => card.removeEventListener("click", open));
    const node = nodes[index];
    if (!node) return;
    node.setAttribute("role", "link");
    node.setAttribute("tabindex", "0");
    node.setAttribute("aria-label", `访问 ${card.querySelector(".friend-name-text")?.textContent?.trim() || "友站"}`);
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    };
    node.addEventListener("click", open);
    node.addEventListener("keydown", keydown);
    cleanups.push(() => {
      node.removeEventListener("click", open);
      node.removeEventListener("keydown", keydown);
      node.removeAttribute("role");
      node.removeAttribute("tabindex");
      node.removeAttribute("aria-label");
      node.style.left = "0px";
      node.style.top = "0px";
    });
  });

  copies.forEach(button => {
    const label = button.textContent || "copy";
    const click = async () => {
      const value = button.closest(".apply-field-val")?.querySelector<HTMLElement>(".apply-field-text")?.textContent?.trim();
      if (!value) return;
      try {
        await navigator.clipboard.writeText(value);
        button.textContent = "copied ✓";
      } catch {
        button.textContent = "复制失败";
      }
      const timer = window.setTimeout(() => { button.textContent = label; timers.delete(timer); }, 1700);
      timers.add(timer);
    };
    button.addEventListener("click", click);
    cleanups.push(() => { button.removeEventListener("click", click); button.textContent = label; });
  });

  const resize = () => { if (starView) drawMap(); };
  window.addEventListener("resize", resize);
  cleanups.push(() => window.removeEventListener("resize", resize));
  setView(false);

  return () => {
    cancelAnimationFrame(frame);
    timers.forEach(timer => window.clearTimeout(timer));
    cleanups.forEach(cleanup => cleanup());
    if (grid) grid.style.display = "";
    if (mapWrap) mapWrap.style.display = "none";
    canvas?.removeAttribute("style");
  };
}
