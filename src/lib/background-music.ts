export type MusicState = "off" | "loading" | "playing" | "paused" | "blocked" | "error";

/** Fetch music only when enabled, and report actual playback rather than intent. */
export function createBackgroundMusic(options: {
  src: string;
  enabled: boolean;
  volume: number;
  resumeAt: number;
  onState: (state: MusicState) => void;
}) {
  const audio = new Audio();
  audio.preload = "none";
  audio.loop = true;
  audio.volume = options.volume;
  audio.src = options.src;
  let enabled = options.enabled;
  let state: MusicState = "off";
  let disposed = false;
  let attempt = 0;
  let resumeAt = options.resumeAt;
  let loadingTimer: number | undefined;
  const clearLoadingTimer = () => {
    window.clearTimeout(loadingTimer);
    loadingTimer = undefined;
  };
  const report = (next: MusicState) => {
    if (disposed) return;
    state = enabled ? next : "off";
    if (state !== "loading") clearLoadingTimer();
    options.onState(state);
  };
  const beginLoading = () => {
    if (state !== "loading") report("loading");
    if (loadingTimer !== undefined) return;
    loadingTimer = window.setTimeout(() => {
      if (disposed || !enabled || state !== "loading") return;
      attempt++;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      report("error");
    }, 6000);
  };
  const restorePosition = () => {
    if (Number.isFinite(resumeAt) && resumeAt > 0 && Number.isFinite(audio.duration) && audio.duration > 0) {
      audio.currentTime = resumeAt % audio.duration;
    }
    resumeAt = 0;
  };
  const play = () => {
    if (disposed || !enabled) return;
    if (!audio.getAttribute("src")) audio.src = options.src;
    if (audio.error) {
      if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) resumeAt = audio.currentTime;
      audio.load();
    }
    const currentAttempt = ++attempt;
    beginLoading();
    // Keep play() directly inside the click/key handler to retain activation.
    void audio.play().catch((error: unknown) => {
      if (disposed || !enabled || currentAttempt !== attempt) return;
      if (error instanceof DOMException && error.name === "NotAllowedError") report("blocked");
      else if (error instanceof DOMException && error.name === "AbortError") report("paused");
      else report("error");
    });
  };
  const onPlaying = () => { if (enabled) report("playing"); else audio.pause(); };
  const onWaiting = () => beginLoading();
  const onPause = () => { if (state !== "blocked" && state !== "error") report("paused"); };
  const onError = () => report("error");
  const onGesture = (event: Event) => {
    // The explicit retry button handles its own click; do not turn its pending
    // retry into an OFF toggle by starting playback on the preceding pointerdown.
    if (event.target instanceof Element && event.target.closest("[data-background-music-toggle]")) return;
    if (enabled && audio.paused && (state === "blocked" || state === "paused")) play();
  };
  const onOnline = () => { if (enabled && state === "error") play(); };
  audio.addEventListener("loadedmetadata", restorePosition);
  audio.addEventListener("playing", onPlaying);
  audio.addEventListener("waiting", onWaiting);
  audio.addEventListener("pause", onPause);
  audio.addEventListener("error", onError);
  document.addEventListener("pointerdown", onGesture, { passive: true });
  document.addEventListener("keydown", onGesture);
  window.addEventListener("online", onOnline);
  report(enabled ? "loading" : "off");
  // A slow decorative video must never postpone an enabled music preference.
  if (enabled) play();

  return {
    audio,
    play,
    setEnabled: (next: boolean) => {
      enabled = next;
      attempt++;
      if (enabled) play();
      else { audio.pause(); report("off"); }
    },
    dispose: () => {
      disposed = true;
      attempt++;
      clearLoadingTimer();
      audio.removeEventListener("loadedmetadata", restorePosition);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("error", onError);
      document.removeEventListener("pointerdown", onGesture);
      document.removeEventListener("keydown", onGesture);
      window.removeEventListener("online", onOnline);
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    },
  };
}
