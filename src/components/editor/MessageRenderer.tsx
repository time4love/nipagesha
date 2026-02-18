"use client";

import { useEffect, useState } from "react";
import DOMPurify, { type Config as DOMPurifyConfig } from "dompurify";
import { getSignedUrl } from "@/app/(app)/view/actions";
import { getSignedUrlsForCard } from "@/app/message/actions";

const PRIVATE_PREFIX = "private://";

const SANITIZE_CONFIG: DOMPurifyConfig = {
  ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "h1", "h2", "h3", "ul", "ol", "li", "a", "img"],
  ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "title"],
};

export interface MessageRendererProps {
  /** Decrypted HTML from the card message (may contain private:// image srcs). */
  html: string;
  /** When set (child view), uses admin-signed URLs so images work without auth. */
  cardId?: string;
  className?: string;
}

/**
 * Renders decrypted message HTML. Replaces img src="private://..." with signed URLs:
 * - If cardId is set (child view): getSignedUrlsForCard (service role, no auth).
 * - Otherwise: getSignedUrl per path (authenticated parent view).
 */
export function MessageRenderer({ html, className, cardId }: MessageRendererProps) {
  const [resolvedHtml, setResolvedHtml] = useState<string | null>(null);

  useEffect(() => {
    const pathRegex = /private:\/\/([^"'\s]+)/g;
    const paths = Array.from(new Set([...html.matchAll(pathRegex)].map((m) => m[1])));

    if (paths.length === 0) {
      setResolvedHtml(html);
      return;
    }

    if (cardId) {
      getSignedUrlsForCard(cardId, paths)
        .then((res) => {
          if (!res.success || !res.urls) {
            setResolvedHtml(html);
            return;
          }
          let result = html;
          paths.forEach((path) => {
            const url = res.urls[path];
            if (path && url) result = result.replaceAll(`${PRIVATE_PREFIX}${path}`, url);
          });
          setResolvedHtml(result);
        })
        .catch(() => setResolvedHtml(html));
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
  }, [html, cardId]);

  const toShow = resolvedHtml ?? html;
  const sanitized = DOMPurify.sanitize(toShow, SANITIZE_CONFIG);

  return (
    <div
      className={`prose prose-sm max-w-none dark:prose-invert ${className ?? ""}`}
      dir="rtl"
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
