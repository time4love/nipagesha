"use client";

import { ArticleContent } from "@/components/articles/ArticleContent";
import { cn } from "@/lib/utils";

export interface RichTextRendererProps {
  /** Sanitized rich-text HTML (same shape as Tiptap output). */
  content: string;
  className?: string;
}

/**
 * Renders forum/editor HTML with the same typography as the Tiptap editor and Preview tab (WYSIWYG).
 */
export function RichTextRenderer({ content, className }: RichTextRendererProps) {
  return (
    <ArticleContent
      html={content}
      compact
      className={cn("text-start max-w-none", className)}
    />
  );
}
