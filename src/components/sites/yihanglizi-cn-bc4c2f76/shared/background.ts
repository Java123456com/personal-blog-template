type Stream = {
  x: number;
  offset: number;
  speed: number;
  length: number;
  alpha: number;
  seed: number;
};

type Star = {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  phase: number;
  speed: number;
  halo: boolean;
  sparkle: boolean;
};

type Meteor = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  life: number;
};

/** Animate the document backdrop: code rain in cyber and the source site's starfield in starry. */
export function enhanceBackground(root: HTMLElement): () => void {
  const canvas = root.querySelector<HTMLCanvasElement>(".doc-bg .bg-canvas.active");
  const context = canvas?.getContext("2d");
  if (!canvas || !context) return () => {};

  const glyphs = "01ABCDEF{}[]<>/;:+-*=XYZ";
  const cellWidth = 18;
  const cellHeight = 20;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let streams: Stream[] = [];
  let stars: Star[] = [];
  let meteors: Meteor[] = [];
  let width = 0;
  let height = 0;
  let frame = 0;
  let startedAt = performance.now();
  let lastDraw = 0;
  let lastMeteorFrame = startedAt;

  const makeStars = () => {
    let seed = (0x65a51e7 ^ Math.round(width * 17 + height * 31)) >>> 0;
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const count = Math.min(720, Math.max(width < 768 ? 140 : 320, Math.round(width * height / 3200)));
    return Array.from({ length: count }, () => ({
      x: random() * width,
      y: random() * height,
      radius: .45 + Math.pow(random(), 2.1) * 1.9,
      alpha: .42 + random() * .56,
      phase: random() * Math.PI * 2,
      speed: 3.2 + random() * 6.2,
      halo: random() < .18,
      sparkle: random() < .035,
    }));
  };

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    streams = Array.from({ length: Math.ceil(width / cellWidth) }, (_, index) => {
      const length = 20 + Math.floor(Math.random() * 32);
      return {
        x: index * cellWidth + Math.random() * 5,
        offset: Math.random() * height,
        speed: 72 + Math.random() * 48,
        length,
        alpha: .28 + Math.random() * .26,
        seed: Math.floor(Math.random() * glyphs.length),
      };
    });
    stars = makeStars();
    meteors = [];
    render(performance.now());
  };

  const drawCyber = (time: number) => {
    const elapsed = reducedMotion.matches ? 0 : (time - startedAt) / 1000;
    const flicker = Math.floor(elapsed * 6);
    context.font = "16px Consolas, monospace";
    context.textAlign = "center";
    streams.forEach(stream => {
      const head = (stream.offset + elapsed * stream.speed) % height;
      for (let index = 0; index < stream.length; index++) {
        const y = (head - index * cellHeight + height) % height;
        const fade = 1 - index / stream.length;
        const opacity = stream.alpha * fade * fade * (index === 0 ? 1.4 : 1);
        context.fillStyle = index === 0
          ? `rgba(255, 207, 112, ${Math.min(opacity, .65)})`
          : `rgba(255, 169, 36, ${opacity})`;
        const glyph = glyphs[(stream.seed + index * 7 + flicker) % glyphs.length];
        context.fillText(glyph, stream.x, y);
      }
    });
  };

  const drawStarry = (time: number) => {
    const sky = context.createRadialGradient(width * .5, height * .3, 0, width * .5, height * .3, Math.max(width, height) * .88);
    sky.addColorStop(0, "#0b0a2e");
    sky.addColorStop(.4, "#0a0e1e");
    sky.addColorStop(1, "#050508");
    context.fillStyle = sky;
    context.fillRect(0, 0, width, height);

    const bands = [
      { y: .24, amplitude: .055, phase: .4, color: "rgba(82, 100, 190, .04)" },
      { y: .47, amplitude: .07, phase: 2.1, color: "rgba(85, 70, 155, .035)" },
      { y: .71, amplitude: .045, phase: 4.2, color: "rgba(35, 125, 150, .03)" },
    ];
    for (const band of bands) {
      context.beginPath();
      context.moveTo(0, height);
      for (let x = 0; x <= width + 40; x += 40) {
        const y = height * (band.y + Math.sin((x / Math.max(width, 1)) * Math.PI * 2 + band.phase) * band.amplitude);
        context.lineTo(x, y);
      }
      context.lineTo(width, height);
      context.closePath();
      context.fillStyle = band.color;
      context.fill();
    }

    const seconds = reducedMotion.matches ? 0 : time / 1000;
    for (const star of stars) {
      const pulse = (1 + Math.sin(seconds * star.speed + star.phase)) / 2;
      const shimmer = reducedMotion.matches ? .82 : .4 + .6 * pulse * pulse;
      const alpha = star.alpha * shimmer;
      if (star.halo) {
        const glowRadius = Math.max(6, star.radius * 6);
        const halo = context.createRadialGradient(star.x, star.y, 0, star.x, star.y, glowRadius);
        halo.addColorStop(0, `rgba(175, 211, 255, ${alpha * .52})`);
        halo.addColorStop(1, "rgba(174, 207, 255, 0)");
        context.fillStyle = halo;
        context.beginPath();
        context.arc(star.x, star.y, glowRadius, 0, Math.PI * 2);
        context.fill();
      }
      if (star.sparkle && alpha > .48) {
        context.strokeStyle = `rgba(205, 231, 255, ${alpha * .38})`;
        context.lineWidth = .7;
        context.beginPath();
        context.moveTo(star.x - 4, star.y);
        context.lineTo(star.x + 4, star.y);
        context.moveTo(star.x, star.y - 4);
        context.lineTo(star.x, star.y + 4);
        context.stroke();
      }
      context.fillStyle = `rgba(241, 247, 255, ${alpha})`;
      context.beginPath();
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      context.fill();
    }

    if (reducedMotion.matches) return;
    const step = Math.min(3, Math.max(0, (time - lastMeteorFrame) / (1000 / 60)));
    lastMeteorFrame = time;
    if (Math.random() < .012 * step && meteors.length < 2) {
      meteors.push({
        x: Math.random() * width * .78,
        y: Math.random() * height * .42,
        vx: 8 + Math.random() * 6,
        vy: 4 + Math.random() * 4,
        length: 70 + Math.random() * 55,
        life: 1,
      });
    }
    meteors = meteors.filter(meteor => {
      meteor.x += meteor.vx * step;
      meteor.y += meteor.vy * step;
      meteor.life -= .021 * step;
      if (meteor.life <= 0) return false;
      const norm = Math.hypot(meteor.vx, meteor.vy);
      const tailX = meteor.x - meteor.vx / norm * meteor.length;
      const tailY = meteor.y - meteor.vy / norm * meteor.length;
      const trail = context.createLinearGradient(tailX, tailY, meteor.x, meteor.y);
      trail.addColorStop(0, "rgba(192, 218, 255, 0)");
      trail.addColorStop(1, `rgba(239, 249, 255, ${meteor.life})`);
      context.strokeStyle = trail;
      context.lineWidth = 2.1;
      context.beginPath();
      context.moveTo(tailX, tailY);
      context.lineTo(meteor.x, meteor.y);
      context.stroke();
      context.fillStyle = `rgba(255, 255, 255, ${meteor.life})`;
      context.beginPath();
      context.arc(meteor.x, meteor.y, 2.4, 0, Math.PI * 2);
      context.fill();
      return true;
    });
  };

  const render = (time: number) => {
    context.clearRect(0, 0, width, height);
    if (document.documentElement.dataset.docTheme === "cyber") drawCyber(time);
    else if (document.documentElement.dataset.docTheme === "starry") drawStarry(time);
  };

  const tick = (time: number) => {
    if (time - lastDraw >= 33) {
      render(time);
      lastDraw = time;
    }
    frame = window.requestAnimationFrame(tick);
  };

  const sync = () => {
    window.cancelAnimationFrame(frame);
    startedAt = performance.now();
    lastDraw = 0;
    lastMeteorFrame = startedAt;
    meteors = [];
    render(startedAt);
    if (["cyber", "starry"].includes(document.documentElement.dataset.docTheme || "") && !reducedMotion.matches && !document.hidden) {
      frame = window.requestAnimationFrame(tick);
    }
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  const themeObserver = new MutationObserver(sync);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-doc-theme"] });
  reducedMotion.addEventListener("change", sync);
  document.addEventListener("visibilitychange", sync);
  resize();
  sync();

  return () => {
    window.cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    themeObserver.disconnect();
    reducedMotion.removeEventListener("change", sync);
    document.removeEventListener("visibilitychange", sync);
    context.clearRect(0, 0, width, height);
  };
}
