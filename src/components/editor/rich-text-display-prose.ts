/**
 * Typography for rich text display — kept in sync between Tiptap (`RichTextEditor`) and
 * sanitized HTML render (`ArticleContent` with `compact`) so preview matches the editor.
 */
export const RICH_TEXT_DISPLAY_PROSE_CLASS =
  "prose prose-sm max-w-none dark:prose-invert " +
  "prose-p:my-1 prose-p:leading-relaxed [&_p:first-child]:mt-0 " +
  "prose-headings:mt-4 prose-headings:mb-2 prose-headings:first:mt-0 " +
  "prose-li:my-0.5 prose-ul:my-2 prose-ol:my-2 " +
  "prose-blockquote:my-3";
