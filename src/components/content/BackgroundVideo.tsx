"use client";

import { useEffect, useState } from "react";
import { canPlayBackgroundVideo, inlineVideoAttributes } from "@/lib/background-video";

/** Start with a poster so an embedded browser cannot autoplay before detection. */
export default function BackgroundVideo({ className, src, poster }: {
  className: string;
  src: string;
  poster: string;
}) {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => { setEnabled(canPlayBackgroundVideo()); }, []);

  return enabled ? (
    <video className={className} src={src} poster={poster} autoPlay muted loop
      playsInline preload="metadata" disablePictureInPicture disableRemotePlayback
      {...inlineVideoAttributes} aria-hidden="true" />
  ) : (
    <img className={className} src={poster} alt="" aria-hidden="true" />
  );
}
