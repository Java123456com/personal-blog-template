/** Load the display font after navigation completes, without holding window.load. */
export function bootstrapOptionalFont(src: string) {
  const load = () => {
    if (!('FontFace' in window)) return;
    const font = new FontFace('Inter', `url("${src}") format("woff2")`, {
      style: 'normal', weight: '100 900', display: 'swap',
    });
    void font.load().then(loaded => document.fonts.add(loaded)).catch(() => {
      // Keep the system-font fallback when the font endpoint is unavailable.
    });
  };
  const schedule = () => window.setTimeout(load, 0);
  if (document.readyState === 'complete') schedule();
  else window.addEventListener('load', schedule, { once: true });
}
