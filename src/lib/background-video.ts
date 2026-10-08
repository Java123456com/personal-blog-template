/** Baidu's embedded player may lift decorative videos above the page. */
export function canPlayBackgroundVideo(): boolean {
  return typeof window !== "undefined"
    && !/baidu|bidubrowser/i.test(window.navigator.userAgent)
    && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export const inlineVideoAttributes = {
  "webkit-playsinline": "",
  "x5-playsinline": "",
};
