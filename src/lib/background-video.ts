/** Baidu's embedded player may lift decorative videos above the page. */
export function canPlayBackgroundVideo(): boolean {
  return typeof window !== "undefined"
    && canPlayBackgroundVideoIn(window);
}

/** Parameterized so the server build cannot fold the inline browser check. */
export function canPlayBackgroundVideoIn(browser: Window): boolean {
  return !/baidu|bidubrowser/i.test(browser.navigator.userAgent)
    && !browser.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export const inlineVideoAttributes = {
  "webkit-playsinline": "",
  "x5-playsinline": "",
};

export const homeBackgroundVideo = {
  src: "/media/starlight-orbit-v2.mp4",
  poster: "/media/starlight-orbit-poster-v2.webp",
};

/** Standalone bootstrap: start decoration once navigation completes. */
export function bootstrapHomeBackground(
  src: string, poster: string, allowed: (browser: Window) => boolean, attributes: Record<string, string>,
) {
  const start = () => {
    if (!allowed(window) || document.hidden || document.documentElement.dataset.docTheme !== "starry") return;
    const layer = document.querySelector(".slh-video-layer");
    if (!layer || layer.querySelector("video")) return;
    const video = document.createElement("video");
    video.className = "slh-video";
    video.muted = video.defaultMuted = true;
    video.loop = video.playsInline = true;
    video.preload = "auto";
    video.disablePictureInPicture = video.disableRemotePlayback = true;
    video.setAttribute("aria-hidden", "true");
    for (const [name, value] of Object.entries(attributes)) video.setAttribute(name, value);
    video.poster = poster;
    video.src = src;
    layer.append(video);
    void video.play().then(() => {
      if (document.hidden || document.documentElement.dataset.docTheme !== "starry") video.pause();
    }).catch((error: unknown) => {
      if (error instanceof DOMException && error.name === "NotAllowedError") video.dataset.autoplayBlocked = "true";
    });
  };
  if (document.readyState === "complete") start();
  else window.addEventListener("load", start, { once: true });
}

/** Buffer before starting/resuming instead of displaying a stop-start background. */
export function manageBackgroundVideo(video: HTMLVideoElement, isActive = () => true) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let disposed = false;
  let buffering: "initial" | "recovery" | false = video.paused ? "initial" : false;
  let playPending = false;
  let autoplayBlocked = video.dataset.autoplayBlocked === "true";

  video.preload = "auto";
  const shouldPlay = () => !disposed && !document.hidden && isActive() && canPlayBackgroundVideo();
  const bufferAhead = () => {
    for (let i = 0; i < video.buffered.length; i++) {
      if (video.buffered.start(i) <= video.currentTime + .05 && video.buffered.end(i) >= video.currentTime) {
        return video.buffered.end(i) - video.currentTime;
      }
    }
    return 0;
  };
  const hasBuffer = () => {
    const target = buffering === "initial" ? .35 : 1.5;
    const remaining = Number.isFinite(video.duration) ? video.duration - video.currentTime : target;
    const required = Math.min(target, Math.max(0, remaining));
    return bufferAhead() >= required - .05;
  };

  const sync = () => {
    if (!shouldPlay()) { video.pause(); return; }
    if (video.error || autoplayBlocked || playPending || video.readyState < HTMLMediaElement.HAVE_FUTURE_DATA
      || (buffering && !hasBuffer())) return;
    if (!video.paused) return;
    buffering = false;
    playPending = true;
    void video.play().catch((error: unknown) => {
      // An interrupted play can resume; other failures wait for a user gesture.
      if (!(error instanceof DOMException) || error.name !== "AbortError") autoplayBlocked = true;
    }).finally(() => {
      playPending = false;
      // A theme/visibility change can occur while play() is still pending.
      if (!shouldPlay()) video.pause();
      else sync();
    });
  };
  const onWaiting = () => {
    // Decoding/seek waits with downloaded frames should resume natively.
    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA || bufferAhead() > .2) return;
    buffering = "recovery";
    video.pause();
    sync();
  };
  const onGesture = () => { autoplayBlocked = false; delete video.dataset.autoplayBlocked; sync(); };
  const onOnline = () => {
    if (shouldPlay() && video.error?.code === MediaError.MEDIA_ERR_NETWORK) {
      const position = video.currentTime;
      buffering = "recovery";
      video.load();
      video.currentTime = position;
    }
    sync();
  };

  for (const event of ["loadeddata", "canplay", "progress", "stalled"]) video.addEventListener(event, sync);
  video.addEventListener("waiting", onWaiting);
  document.addEventListener("visibilitychange", sync);
  document.addEventListener("pointerdown", onGesture, { passive: true });
  document.addEventListener("keydown", onGesture);
  window.addEventListener("pageshow", sync);
  window.addEventListener("online", onOnline);
  reducedMotion.addEventListener("change", sync);
  sync();

  return {
    sync,
    dispose: () => {
      disposed = true;
      for (const event of ["loadeddata", "canplay", "progress", "stalled"]) video.removeEventListener(event, sync);
      video.removeEventListener("waiting", onWaiting);
      document.removeEventListener("visibilitychange", sync);
      document.removeEventListener("pointerdown", onGesture);
      document.removeEventListener("keydown", onGesture);
      window.removeEventListener("pageshow", sync);
      window.removeEventListener("online", onOnline);
      reducedMotion.removeEventListener("change", sync);
      video.pause();
    },
  };
}
