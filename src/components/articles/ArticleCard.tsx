"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  getPrivacyEnhancedYouTubeEmbedUrl,
  getYouTubeThumbnailUrl,
} from "@/lib/youtube";

const ReactPlayer = dynamic(
  () => import("react-player").then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div
        className="aspect-video w-full rounded-lg bg-muted animate-pulse"
        aria-hidden
      />
    ),
  }
);

export type ArticleMediaType = "video" | "image";

export interface ArticleCardProps {
  title: string;
  mediaType: ArticleMediaType;
  mediaUrl: string;
  className?: string;
  /** Optional: pass to use Next/Image with fill and object-cover on a wrapper */
  imageClassName?: string;
  /** Alt for image (accessibility) */
  imageAlt?: string;
}

export function ArticleCard({
  title,
  mediaType,
  mediaUrl,
  className,
  imageClassName,
  imageAlt = "תמונה למאמר",
}: ArticleCardProps) {
  const embedUrl = useMemo(
    () =>
      mediaType === "video"
        ? getPrivacyEnhancedYouTubeEmbedUrl(mediaUrl)
        : null,
    [mediaType, mediaUrl]
  );
  const thumbnailUrl = useMemo(
    () =>
      mediaType === "video" ? getYouTubeThumbnailUrl(mediaUrl, "hq") : null,
    [mediaType, mediaUrl]
  );

  if (mediaType === "video") {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-lg bg-black aspect-video w-full",
          className
        )}
      >
        {embedUrl ? (
          <ReactPlayer
            src={embedUrl}
            width="100%"
            height="100%"
            light={thumbnailUrl ?? true}
            playing={false}
            title={title}
          />
        ) : (
          <div
            className="flex aspect-video w-full items-center justify-center rounded-lg border bg-muted text-muted-foreground text-sm"
            role="img"
            aria-label="וידאו לא זמין"
          >
            קישור לא תקין
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative aspect-video w-full overflow-hidden rounded-lg", className)}>
      <Image
        src={mediaUrl}
        alt={imageAlt}
        fill
        className={cn("object-cover", imageClassName)}
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  );
}
