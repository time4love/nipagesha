/**
 * Shared utilities for child card display and validation.
 * Keeps child-name and HTML helpers in one place (DRY).
 */

/**
 * Returns display name for the child (first name only; last name removed for privacy).
 */
export function formatChildName(firstName: string, _lastName?: string): string {
  return firstName.trim();
}

/**
 * Strips HTML tags and returns plain text. Used for "is empty" checks on rich content.
 */
export function stripHtmlToText(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

/**
 * Returns true if the HTML has meaningful text content (ignoring tags).
 */
export function hasHtmlContent(html: string): boolean {
  return stripHtmlToText(html).length > 0;
}
