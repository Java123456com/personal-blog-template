/** Paint the cyber rain immediately, before React and the main client bundle arrive. */
export function bootstrapCyberRain() {
  if (document.documentElement.dataset.docTheme !== "cyber") return;
  const canvas = document.querySelector<HTMLCanvasElement>(".wasteland .rain-canvas");
  const context = canvas?.getContext("2d");
  if (!canvas || !context) return;

  const browser = window as Window & { __stopCyberRain?: () => void };
  browser.__stopCyberRain?.();
  const glyphs = "01{}[]<>/;:+-*=XYZ";
  let drops: number[] = [];
  let frame = 0;
  let tick = 0;
  let stopped = false;
  let observer: ResizeObserver | undefined;

  const resize = () => {
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    drops = Array.from({ length: Math.ceil(width / 25) }, () => Math.random() * height / 16);
  };
  const paint = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    context.fillStyle = "rgba(10,8,5,.14)";
    context.fillRect(0, 0, width, height);
    context.font = "13px monospace";
    drops.forEach((drop, index) => {
      for (let trail = 0; trail < 12; trail++) {
        const fade = 1 - trail / 12;
        const y = (drop * 16 - trail * 16 + height) % height;
        context.fillStyle = `rgba(255,176,0,${(.08 + Math.random() * .34) * fade * fade})`;
        context.fillText(glyphs[(index * 5 + trail * 7 + tick) % glyphs.length], index * 25, y);
      }
      drops[index] = drop * 16 > height && Math.random() > .965 ? 0 : drop + .4;
    });
    canvas.dataset.rainReady = "inline";
  };
  const animate = () => {
    if (stopped) return;
    frame = requestAnimationFrame(animate);
    if (++tick % 4 === 0) paint();
  };
  const stop = () => {
    stopped = true;
    cancelAnimationFrame(frame);
    observer?.disconnect();
    window.removeEventListener("resize", resize);
    if (browser.__stopCyberRain === stop) delete browser.__stopCyberRain;
  };

  browser.__stopCyberRain = stop;
  resize();
  paint();
  animate();
  window.addEventListener("resize", resize, { passive: true });
  if ("ResizeObserver" in window) {
    observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement || canvas);
  }
}
