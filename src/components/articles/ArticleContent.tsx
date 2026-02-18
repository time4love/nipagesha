"use client";

import DOMPurify, { type Config as DOMPurifyConfig } from "dompurify";
import { cn } from "@/lib/utils";

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
}

/**
 * Renders article HTML with typography (prose). Sanitizes to prevent XSS.
 * Article content uses public image URLs only.
 */
export function ArticleContent({ html, className }: ArticleContentProps) {
  const sanitized = DOMPurify.sanitize(html ?? "", SANITIZE_CONFIG);
  if (!sanitized.trim()) return null;

  return (
    <div
      className={cn(
        "prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-p:leading-relaxed prose-ul:my-4 prose-ol:my-4",
        className
      )}
      dir="rtl"
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
