"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useMemo } from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getPrivacyEnhancedYouTubeEmbedUrl,
  getYouTubeThumbnailUrl,
  REACT_PLAYER_YOUTUBE_CONFIG,
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

export type ArticleMediaType = "video" | "image" | "link";

export interface ArticleCardProps {
  title: string;
  mediaType: ArticleMediaType;
  mediaUrl: string;
  /** When `mediaType` is `link`, optional preview image URL. */
  linkThumbnail?: string | null;
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
  linkThumbnail = null,
  className,
  imageClassName,
  imageAlt = "תמונה לתוכן",
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

  if (mediaType === "link") {
    const hasThumb =
      typeof linkThumbnail === "string" &&
      linkThumbnail.trim().length > 0 &&
      (linkThumbnail.startsWith("http://") ||
        linkThumbnail.startsWith("https://") ||
        linkThumbnail.startsWith("/"));

    return (
      <div
        className={cn(
          "relative aspect-video w-full overflow-hidden rounded-lg bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950",
          className
        )}
      >
        {hasThumb ? (
          <Image
            src={linkThumbnail!.trim()}
            alt=""
            fill
            unoptimized
            className="object-cover opacity-95"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : null}
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/35"
          aria-hidden
        >
          <div className="flex flex-col items-center gap-2 text-white drop-shadow-md">
            <ExternalLink className="size-14 sm:size-16" strokeWidth={1.25} />
            <span className="text-xs font-medium opacity-95 sm:text-sm">
              קישור חיצוני
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (mediaType === "video") {
    return (
      <div
        className={cn(
          "rounded-lg bg-black aspect-video w-full",
          className
        )}
      >
        {embedUrl ? (
          <ReactPlayer
            src={embedUrl}
            width="100%"
            height="100%"
            controls
            light={thumbnailUrl ?? true}
            playing={false}
            title={title}
            config={REACT_PLAYER_YOUTUBE_CONFIG}
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
