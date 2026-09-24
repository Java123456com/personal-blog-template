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
  const foundPage = root.querySelector<HTMLElement>(".friends-page");
  if (!foundPage) return () => {};
  const page: HTMLElement = foundPage;

  const buttons = Array.from(page.querySelectorAll<HTMLButtonElement>(".view-btn"));
  const grid = page.querySelector<HTMLElement>(".friends-grid");
  const mapWrap = page.querySelector<HTMLElement>(".starmap-wrap");
  const map = page.querySelector<HTMLElement>(".starmap");
  const canvas = page.querySelector<HTMLCanvasElement>(".starmap-canvas");
  const thumb = page.querySelector<HTMLElement>(".view-switch-thumb");
  const cards = Array.from(page.querySelectorAll<HTMLButtonElement>(".friend-card"));
  const nodes = Array.from(page.querySelectorAll<HTMLElement>(".sm-node-friend"));
  const resetButton = page.querySelector<HTMLButtonElement>(".sm-mini-btn");
  const cleanups: Array<() => void> = [];
  const manualPositions = new Map<HTMLElement, { x: number; y: number }>();
  const suppressedClicks = new WeakSet<HTMLElement>();
  let starView = false;
  let warping = false;
  let stopWarp: (() => void) | null = null;
  let frame = 0;

  function startWarp(card: HTMLElement, url: string) {
    if (warping) return;
    warping = true;
    page.classList.add("is-warping");

    const name = card.querySelector<HTMLElement>(".friend-name-text")?.textContent?.trim() || "UNKNOWN NODE";
    const nodeId = card.querySelector<HTMLElement>(".friend-id")?.textContent?.trim() || "NODE";
    const overlay = document.createElement("div");
    overlay.className = "warp-overlay";
    overlay.setAttribute("data-v-88f65db3", "");
    overlay.setAttribute("role", "status");
    overlay.setAttribute("aria-live", "polite");
    overlay.innerHTML = `
      <canvas class="warp-canvas" data-v-88f65db3="" aria-hidden="true"></canvas>
      <div class="warp-vignette" data-v-88f65db3="" aria-hidden="true"></div>
      <div class="warp-scanline" data-v-88f65db3="" aria-hidden="true"></div>
      <div class="warp-hud" data-v-88f65db3="">
        <div class="warp-hud-top" data-v-88f65db3="">
          <span class="warp-hud-tag" data-v-88f65db3=""><span class="warp-hud-dot" data-v-88f65db3=""></span>UPLINK · ACTIVE</span>
          <span class="warp-hud-tag dim" data-v-88f65db3="">ESC · ABORT</span>
        </div>
        <div class="warp-hud-center" data-v-88f65db3="">
          <span class="warp-target-line" data-v-88f65db3="">TARGET ACQUIRED · <b data-warp-node></b></span>
          <strong class="warp-target-name" data-v-88f65db3="" data-warp-name></strong>
          <span class="warp-target-url" data-v-88f65db3="" data-warp-url></span>
          <div class="warp-progress" data-v-88f65db3=""><div class="warp-progress-bar" data-v-88f65db3="" data-warp-bar></div><span class="warp-progress-text" data-v-88f65db3="" data-warp-percent>00%</span></div>
          <div class="warp-log" data-v-88f65db3="" data-warp-log></div>
        </div>
        <div class="warp-hud-bottom" data-v-88f65db3=""><span class="warp-hud-tag dim" data-v-88f65db3="">CONSTELLATION NETWORK</span><span class="warp-hud-tag" data-v-88f65db3="">WARP DRIVE · READY</span></div>
      </div>`;

    overlay.querySelector<HTMLElement>("[data-warp-node]")!.textContent = nodeId;
    overlay.querySelector<HTMLElement>("[data-warp-name]")!.textContent = name;
    overlay.querySelector<HTMLElement>("[data-warp-url]")!.textContent = url;
    const bar = overlay.querySelector<HTMLElement>("[data-warp-bar]")!;
    const percent = overlay.querySelector<HTMLElement>("[data-warp-percent]")!;
    const log = overlay.querySelector<HTMLElement>("[data-warp-log]")!;
    const warpCanvas = overlay.querySelector<HTMLCanvasElement>(".warp-canvas")!;
    const ctx = warpCanvas.getContext("2d");
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    page.appendChild(overlay);

    const messages = [
      [8, "resolving stellar coordinates"],
      [28, `handshake accepted by ${nodeId}`],
      [51, "encrypted route established"],
      [74, "opening hyperspace channel"],
      [93, "jump lock confirmed"],
    ] as const;
    let shown = 0;
    let warpFrame = 0;
    let finishTimer = 0;
    const started = performance.now();
    const duration = 1850;
    const stars = Array.from({ length: 120 }, (_, index) => ({
      angle: (index / 120) * Math.PI * 2 + Math.random() * .07,
      offset: Math.random(),
      speed: .55 + Math.random() * .9,
      hue: index % 5 === 0 ? 268 : 190,
    }));

    const render = (now: number) => {
      const raw = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - raw, 2.7);
      const value = Math.min(100, Math.floor(eased * 100));
      bar.style.width = `${value}%`;
      percent.textContent = `${String(value).padStart(2, "0")}%`;
      while (shown < messages.length && value >= messages[shown][0]) {
        const item = document.createElement("span");
        item.className = "warp-log-item";
        item.setAttribute("data-v-88f65db3", "");
        const arrow = document.createElement("span");
        arrow.className = "warp-log-arrow";
        arrow.setAttribute("data-v-88f65db3", "");
        arrow.textContent = "›";
        item.append(arrow, document.createTextNode(messages[shown][1]));
        log.appendChild(item);
        shown += 1;
      }

      if (ctx) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = window.innerWidth;
        const height = window.innerHeight;
        const pixelWidth = Math.round(width * dpr);
        const pixelHeight = Math.round(height * dpr);
        if (warpCanvas.width !== pixelWidth || warpCanvas.height !== pixelHeight) {
          warpCanvas.width = pixelWidth;
          warpCanvas.height = pixelHeight;
          warpCanvas.style.width = `${width}px`;
          warpCanvas.style.height = `${height}px`;
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);
        ctx.globalCompositeOperation = "lighter";
        const cx = width / 2;
        const cy = height / 2;
        const reach = Math.hypot(width, height) * .58;
        stars.forEach((star) => {
          const travel = (star.offset + eased * star.speed) % 1;
          const radius = 18 + travel * reach;
          const streak = 4 + eased * eased * 88 * (1 - travel * .35);
          const cos = Math.cos(star.angle);
          const sin = Math.sin(star.angle);
          ctx.beginPath();
          ctx.moveTo(cx + cos * Math.max(8, radius - streak), cy + sin * Math.max(8, radius - streak));
          ctx.lineTo(cx + cos * radius, cy + sin * radius);
          ctx.strokeStyle = `hsla(${star.hue}, 95%, 72%, ${.12 + eased * .64})`;
          ctx.lineWidth = .6 + eased * 1.8;
          ctx.stroke();
        });
        ctx.globalCompositeOperation = "source-over";
      }

      if (raw < 1) {
        warpFrame = requestAnimationFrame(render);
        return;
      }
      overlay.classList.add("is-out");
      finishTimer = window.setTimeout(() => {
        const opened = window.open(url, "_blank");
        if (opened) opened.opener = null;
        stopWarp?.();
        if (!opened) window.location.assign(url);
      }, 430);
    };

    const abort = (event: KeyboardEvent) => {
      if (event.key === "Escape") stopWarp?.();
    };
    window.addEventListener("keydown", abort);
    stopWarp = () => {
      cancelAnimationFrame(warpFrame);
      window.clearTimeout(finishTimer);
      window.removeEventListener("keydown", abort);
      overlay.remove();
      document.body.style.overflow = previousOverflow;
      page.classList.remove("is-warping");
      warping = false;
      stopWarp = null;
    };
    warpFrame = requestAnimationFrame(render);
  }

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
      const manual = manualPositions.get(node);
      const x = manual ? Math.max(34, Math.min(width - 34, manual.x)) : cx + Math.cos(angle) * radiusX;
      const y = manual ? Math.max(34, Math.min(height - 64, manual.y)) : cy + Math.sin(angle) * radiusY;
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
    mapWrap?.classList.toggle("in-view", next);
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
    const open = () => {
      const node = nodes[index];
      if (node && suppressedClicks.has(node)) return;
      startWarp(card, url);
    };
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

    let dragging = false;
    let moved = false;
    let startX = 0;
    let startY = 0;
    const pointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || !map) return;
      dragging = true;
      moved = false;
      startX = event.clientX;
      startY = event.clientY;
      node.setPointerCapture(event.pointerId);
    };
    const pointerMove = (event: PointerEvent) => {
      if (!dragging || !map) return;
      if (Math.hypot(event.clientX - startX, event.clientY - startY) > 4) moved = true;
      if (!moved) return;
      const rect = map.getBoundingClientRect();
      manualPositions.set(node, { x: event.clientX - rect.left, y: event.clientY - rect.top });
      drawMap();
    };
    const pointerUp = (event: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      if (node.hasPointerCapture(event.pointerId)) node.releasePointerCapture(event.pointerId);
      if (!moved) return;
      suppressedClicks.add(node);
      window.setTimeout(() => suppressedClicks.delete(node), 0);
    };
    node.style.touchAction = "none";
    node.addEventListener("pointerdown", pointerDown);
    node.addEventListener("pointermove", pointerMove);
    node.addEventListener("pointerup", pointerUp);
    node.addEventListener("pointercancel", pointerUp);
    cleanups.push(() => {
      node.removeEventListener("click", open);
      node.removeEventListener("keydown", keydown);
      node.removeEventListener("pointerdown", pointerDown);
      node.removeEventListener("pointermove", pointerMove);
      node.removeEventListener("pointerup", pointerUp);
      node.removeEventListener("pointercancel", pointerUp);
      node.removeAttribute("role");
      node.removeAttribute("tabindex");
      node.removeAttribute("aria-label");
      node.style.left = "0px";
      node.style.top = "0px";
      node.style.touchAction = "";
    });
  });

  const reset = () => {
    manualPositions.clear();
    drawMap();
  };
  resetButton?.addEventListener("click", reset);
  cleanups.push(() => resetButton?.removeEventListener("click", reset));

  const resize = () => { if (starView) drawMap(); };
  window.addEventListener("resize", resize);
  cleanups.push(() => window.removeEventListener("resize", resize));
  setView(false);

  return () => {
    stopWarp?.();
    cancelAnimationFrame(frame);
    cleanups.forEach(cleanup => cleanup());
    if (grid) grid.style.display = "";
    if (mapWrap) mapWrap.style.display = "none";
    canvas?.removeAttribute("style");
  };
}
