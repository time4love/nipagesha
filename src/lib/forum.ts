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

/**
 * Split flat comment list into roots and replies (single depth).
 * Roots and each reply list are sorted by `created_at` ascending.
 */
export function groupForumCommentsByParent<
  T extends { parent_id: string | null; created_at: string; id: string },
>(comments: T[]): { roots: T[]; repliesByParentId: Map<string, T[]> } {
  const roots: T[] = [];
  const repliesByParentId = new Map<string, T[]>();
  for (const c of comments) {
    if (!c.parent_id) {
      roots.push(c);
    } else {
      const list = repliesByParentId.get(c.parent_id) ?? [];
      list.push(c);
      repliesByParentId.set(c.parent_id, list);
    }
  }
  const byTime = (a: T, b: T) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  roots.sort(byTime);
  for (const [, list] of repliesByParentId) {
    list.sort(byTime);
  }
  return { roots, repliesByParentId };
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
