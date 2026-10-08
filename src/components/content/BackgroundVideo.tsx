"use client";

import { useEffect, useRef, useState } from "react";
import { canPlayBackgroundVideo, inlineVideoAttributes, manageBackgroundVideo } from "@/lib/background-video";

/** Start with a poster so an embedded browser cannot autoplay before detection. */
export default function BackgroundVideo({ className, src, poster }: {
  className: string;
  src: string;
  poster: string;
}) {
  const [enabled, setEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => { setEnabled(canPlayBackgroundVideo()); }, []);
  useEffect(() => {
    if (!enabled || !videoRef.current) return;
    return manageBackgroundVideo(videoRef.current).dispose;
  }, [enabled, src]);

  return enabled ? (
    <video ref={videoRef} className={className} src={src} poster={poster} muted loop
      playsInline preload="auto" disablePictureInPicture disableRemotePlayback
      {...inlineVideoAttributes} aria-hidden="true" />
  ) : (
    <img className={className} src={poster} alt="" decoding="async" aria-hidden="true" />
  );
}
