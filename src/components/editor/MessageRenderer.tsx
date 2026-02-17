"use client";

import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { getSignedUrl } from "@/app/(app)/view/actions";

const PRIVATE_PREFIX = "private://";

export interface MessageRendererProps {
  /** Decrypted HTML from the card message (may contain private:// image srcs). */
  html: string;
  className?: string;
}

/**
 * Renders decrypted message HTML. Replaces img src="private://..." with signed URLs
 * via getSignedUrl (1h expiry), then sanitizes and renders.
 */
export function MessageRenderer({ html, className }: MessageRendererProps) {
  const [resolvedHtml, setResolvedHtml] = useState<string | null>(null);

  useEffect(() => {
    const pathRegex = /private:\/\/([^"'\s]+)/g;
    const paths = Array.from(new Set([...html.matchAll(pathRegex)].map((m) => m[1])));

    if (paths.length === 0) {
      setResolvedHtml(html);
      return;
    }

    let result = html;
    Promise.all(paths.map((path) => getSignedUrl(path)))
      .then((results) => {
        results.forEach((r, i) => {
          const path = paths[i];
          const url = r.url ?? "";
          if (path && url) {
            result = result.replaceAll(`${PRIVATE_PREFIX}${path}`, url);
          }
        });
        setResolvedHtml(result);
      })
      .catch(() => {
        setResolvedHtml(html);
      });
  }, [html]);

  const toShow = resolvedHtml ?? html;
  const sanitized = DOMPurify.sanitize(toShow, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "h1", "h2", "h3", "ul", "ol", "li", "a", "img"],
    ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "title"],
  });

  return (
    <div
      className={`prose prose-sm max-w-none dark:prose-invert ${className ?? ""}`}
      dir="rtl"
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
