"use client";

import { useEffect, useRef, useState } from "react";

const VIDEO_SRC = "/videos/songs-bg.mp4";

/**
 * Defers the heavy MP4 until the section is near the viewport, then until the browser
 * is idle. Avoids contending with navigation and first-load JS for connection/bandwidth.
 */
export function SongsSectionBackgroundVideo() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    let loaded = false;

    const run = () => {
      if (loaded) return;
      loaded = true;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setShowVideo(true));
      });
    };

    const scheduleLoad = () => {
      if (loaded) return;
      if (typeof requestIdleCallback !== "undefined") {
        requestIdleCallback(run, { timeout: 1_200 });
      } else {
        setTimeout(run, 200);
      }
    };

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          obs.disconnect();
          scheduleLoad();
        }
      },
      { root: null, rootMargin: "200px 0px", threshold: 0.01 }
    );
    obs.observe(el);

    return () => {
      obs.disconnect();
    };
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0 z-0 overflow-hidden" aria-hidden>
      {showVideo ? (
        <video
          className="h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="none"
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
      ) : null}
    </div>
  );
}
