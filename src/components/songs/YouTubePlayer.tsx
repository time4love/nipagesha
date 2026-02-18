"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

/**
 * Extracts YouTube video ID from various URL formats.
 */
function getYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  // Match youtu.be/ID, youtube.com/watch?v=ID, youtube.com/embed/ID
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = trimmed.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}

const ReactPlayer = dynamic(() => import("react-player").then((m) => m.default), {
  ssr: false,
  loading: () => (
    <div
      className="aspect-video w-full rounded-xl bg-muted animate-pulse"
      aria-hidden
    />
  ),
});

interface YouTubePlayerProps {
  url: string;
  className?: string;
  title?: string;
}

export function YouTubePlayer({ url, className, title }: YouTubePlayerProps) {
  const videoId = useMemo(() => getYouTubeVideoId(url), [url]);

  if (!videoId) {
    return (
      <div
        className={cn(
          "aspect-video w-full rounded-xl border bg-muted flex items-center justify-center text-muted-foreground text-sm",
          className
        )}
        role="img"
        aria-label="וידאו לא זמין"
      >
        קישור לא תקין
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl shadow-md aspect-video w-full bg-black",
        className
      )}
    >
      <ReactPlayer
        src={`https://www.youtube.com/watch?v=${videoId}`}
        width="100%"
        height="100%"
        playing={false}
        title={title ?? "סרטון יוטיוב"}
      />
    </div>
  );
}
