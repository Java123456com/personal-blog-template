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

/** Buffer before starting/resuming instead of displaying a stop-start background. */
export function manageBackgroundVideo(video: HTMLVideoElement, isActive = () => true) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let disposed = false;
  let buffering = true;
  let playPending = false;
  let autoplayBlocked = false;

  video.preload = "auto";
  const shouldPlay = () => !disposed && !document.hidden && isActive() && canPlayBackgroundVideo();
  const hasBuffer = () => {
    const remaining = Number.isFinite(video.duration) ? video.duration - video.currentTime : 3;
    const required = Math.min(3, Math.max(0, remaining));
    for (let i = 0; i < video.buffered.length; i++) {
      if (video.buffered.start(i) <= video.currentTime + .05
        && video.buffered.end(i) - video.currentTime >= required - .05) return true;
    }
    return false;
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
    buffering = true;
    video.pause();
    sync();
  };
  const onGesture = () => { autoplayBlocked = false; sync(); };
  const onOnline = () => {
    if (shouldPlay() && video.error?.code === MediaError.MEDIA_ERR_NETWORK) {
      const position = video.currentTime;
      buffering = true;
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
