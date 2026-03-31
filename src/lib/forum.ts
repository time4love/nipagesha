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
