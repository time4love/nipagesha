import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";

const EDIT_THRESHOLD_MS = 3_000;

/** True if the post was edited meaningfully after creation (for "(נערך)" label). */
export function isForumPostEdited(createdAt: string, updatedAt: string): boolean {
  const created = new Date(createdAt).getTime();
  const updated = new Date(updatedAt).getTime();
  if (Number.isNaN(created) || Number.isNaN(updated)) return false;
  return updated - created > EDIT_THRESHOLD_MS;
}

/** Same rule as posts — for forum comment "(נערך)" when {@link ForumCommentRow#updated_at} exists. */
export function isForumCommentEdited(createdAt: string, updatedAt: string | undefined): boolean {
  if (!updatedAt) return false;
  return isForumPostEdited(createdAt, updatedAt);
}

/** First <img src> from HTML (forum thumbnails / OG image). */
export function extractFirstImageUrlFromHtml(html: string): string | null {
  const doubleQuote = html.match(/<img[^>]+src="([^">]+)"/i);
  if (doubleQuote?.[1]?.trim()) return doubleQuote[1].trim();
  const singleQuote = html.match(/<img[^>]+src='([^'>]+)'/i);
  if (singleQuote?.[1]?.trim()) return singleQuote[1].trim();
  return null;
}

/** Strip HTML for list snippets (server-safe). */
export function stripHtmlToSnippet(html: string, maxLen = 180): string {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen)}…`;
}

/** Relative time in Hebrew via date-fns (e.g. "לפני שעתיים"). */
export function formatForumRelativeTime(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: he });
}

/** Absolute URL for Open Graph (site origin + default image path). */
export function resolveForumOgImageUrl(
  candidate: string | null | undefined,
  siteOrigin: string
): string {
  const u = candidate?.trim();
  const origin = siteOrigin.replace(/\/$/, "");
  if (!u) return `${origin}/opengraph-image.png`;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("//")) return `https:${u}`;
  if (u.startsWith("/")) return `${origin}${u}`;
  return `${origin}/${u}`;
}
