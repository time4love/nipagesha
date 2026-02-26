/**
 * YouTube URL utilities for privacy-enhanced embeds (youtube-nocookie.com).
 * Using the nocookie domain avoids third-party tracking cookies until the user plays.
 */

const YOUTUBE_VIDEO_ID_PATTERNS = [
  /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
  /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  /(?:youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
];

/** Base URL for privacy-enhanced embeds (no tracking cookies until play). */
export const YOUTUBE_NOCOOKIE_EMBED_BASE = "https://www.youtube-nocookie.com/embed";

/**
 * Extracts YouTube video ID from youtube.com or youtu.be URLs.
 * @returns The 11-character video ID or null if not a valid YouTube URL.
 */
export function getYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  for (const re of YOUTUBE_VIDEO_ID_PATTERNS) {
    const m = trimmed.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}

/**
 * Returns a privacy-enhanced embed URL for the given YouTube URL.
 * Use this when rendering iframes or ReactPlayer to avoid tracking cookies.
 * @returns e.g. "https://www.youtube-nocookie.com/embed/VIDEO_ID" or null.
 */
export function getPrivacyEnhancedYouTubeEmbedUrl(url: string): string | null {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;
  return `${YOUTUBE_NOCOOKIE_EMBED_BASE}/${videoId}`;
}

/** YouTube thumbnail quality for getYouTubeThumbnailUrl */
export type YouTubeThumbnailQuality = "default" | "hq" | "mq" | "sd" | "maxres";

/**
 * Returns the URL of YouTube's static thumbnail image for the video.
 * Use for "light" preview so the card shows a thumbnail without oEmbed/nocookie issues.
 * @param url - Any valid YouTube URL (youtube.com or youtu.be)
 * @param quality - "maxres" (1280x720), "sd" (640x480), "hq" (480x360), "mq" (320x180), "default" (120x90)
 */
export function getYouTubeThumbnailUrl(
  url: string,
  quality: YouTubeThumbnailQuality = "hq"
): string | null {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;
  const names: Record<YouTubeThumbnailQuality, string> = {
    default: "default",
    mq: "mqdefault",
    hq: "hqdefault",
    sd: "sddefault",
    maxres: "maxresdefault",
  };
  return `https://img.youtube.com/vi/${videoId}/${names[quality]}.jpg`;
}
