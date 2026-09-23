/** Provide a readable local placeholder when the source site no longer serves an image. */
export function enhanceAssets(root: HTMLElement): () => void {
  const cleanups: Array<() => void> = [];
  for (const img of root.querySelectorAll<HTMLImageElement>("img")) {
    const onError = () => {
      img.removeEventListener("error", onError);
      const label = (img.alt || "✦").trim().slice(0, 2).replace(/[<>&"']/g, "") || "✦";
      const color = img.closest(".friend-card,.sm-node") ? "#22d3ee" : "#e6a831";
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" rx="20" fill="#1d2131"/><rect x="2" y="2" width="92" height="92" rx="18" fill="none" stroke="${color}" stroke-opacity=".5" stroke-width="2"/><text x="48" y="55" text-anchor="middle" dominant-baseline="middle" fill="${color}" font-size="27" font-family="sans-serif" font-weight="700">${label}</text></svg>`;
      img.src = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    };
    img.addEventListener("error", onError);
    if (img.complete && img.getAttribute("src") && !img.naturalWidth) onError();
    cleanups.push(() => img.removeEventListener("error", onError));
  }
  return () => cleanups.forEach(cleanup => cleanup());
}
