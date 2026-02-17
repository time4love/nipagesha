"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageRenderer } from "@/components/editor/MessageRenderer";

export interface MessageCardProps {
  /** Child's display name (e.g. for preview: "דני כהן"). */
  childName: string;
  /** Rich text HTML (may contain private:// image srcs; resolved via getSignedUrl). */
  htmlContent: string;
  /** When true, indicates preview mode (styling can match child page 1:1). */
  isPreview?: boolean;
}

/**
 * Shared card UI for displaying the message as the child sees it.
 * Resolves private:// image URLs to signed URLs (same logic as MessageRenderer).
 */
export function MessageCard({
  childName,
  htmlContent,
  isPreview = false,
}: MessageCardProps) {
  const title = childName.trim() ? `המסר ל${childName.trim()}` : "המסר שלך";

  return (
    <Card
      className="border-teal-200 dark:border-teal-800 w-full"
      dir="rtl"
      aria-label={isPreview ? "תצוגה מקדימה של המסר" : undefined}
    >
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <MessageRenderer html={htmlContent} className="min-h-[120px]" />
      </CardContent>
    </Card>
  );
}
