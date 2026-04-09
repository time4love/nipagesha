"use client";

import DOMPurify, { type Config as DOMPurifyConfig } from "dompurify";
import { cn } from "@/lib/utils";
import { RICH_TEXT_DISPLAY_PROSE_CLASS } from "@/components/editor/rich-text-display-prose";

const SANITIZE_CONFIG: DOMPurifyConfig = {
  ALLOWED_TAGS: [
    "p",
    "br",
    "strong",
    "em",
    "u",
    "h1",
    "h2",
    "h3",
    "ul",
    "ol",
    "li",
    "a",
    "img",
    "blockquote",
  ],
  ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "title", "style", "class"],
};

export interface ArticleContentProps {
  html: string;
  className?: string;
  /**
   * Use forum/social-style tight paragraph rhythm and match `RichTextEditor` preview (recommended for forum posts).
   */
  compact?: boolean;
}

/**
 * Renders article HTML with typography (prose). Sanitizes to prevent XSS.
 * Article content uses public image URLs only.
 */
export function ArticleContent({ html, className, compact = false }: ArticleContentProps) {
  const sanitized = DOMPurify.sanitize(html ?? "", SANITIZE_CONFIG);
  if (!sanitized.trim()) return null;

  return (
    <div
      className={cn(
        compact
          ? RICH_TEXT_DISPLAY_PROSE_CLASS
          : "prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-p:my-3 prose-p:leading-relaxed prose-ul:my-4 prose-ol:my-4",
        className
      )}
      dir="rtl"
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
