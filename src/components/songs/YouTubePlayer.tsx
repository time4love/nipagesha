"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { getPrivacyEnhancedYouTubeEmbedUrl } from "@/lib/youtube";

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
  const embedUrl = useMemo(() => getPrivacyEnhancedYouTubeEmbedUrl(url), [url]);

  if (!embedUrl) {
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
        src={embedUrl}
        width="100%"
        height="100%"
        playing={false}
        title={title ?? "סרטון יוטיוב"}
      />
    </div>
  );
}
