"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const TOOLTIP_LABEL = "העתק קישור אישי לילד";
const COPY_SUCCESS = "הקישור הועתק! כעת ניתן לשלוח אותו לילד.";
const COPY_ERROR = "לא ניתן להעתיק את הקישור.";

/** Pre-filled line for native share + clipboard (gentle, inviting). */
const SHARE_MESSAGE_INTRO = "היי, מחכה לך מסר אישי ממני כאן:";

function buildSharePayload(url: string): { textBlock: string } {
  const textBlock = `${SHARE_MESSAGE_INTRO} \n${url}`;
  return { textBlock };
}

export interface ChildCardShareLinkButtonProps {
  cardId: string;
}

export function ChildCardShareLinkButton({ cardId }: ChildCardShareLinkButtonProps) {
  const handleClick = async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/message/${cardId}`
        : "";
    const { textBlock } = buildSharePayload(url);

    const canShare =
      typeof navigator !== "undefined" && typeof navigator.share === "function";

    if (canShare && url) {
      try {
        await navigator.share({
          title: SHARE_MESSAGE_INTRO,
          text: textBlock,
          url,
        });
        return;
      } catch (err) {
        const e = err as { name?: string };
        if (e?.name === "AbortError") return;
        // Fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(textBlock);
      toast.success(COPY_SUCCESS);
    } catch {
      toast.error(COPY_ERROR);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="size-9 shrink-0 p-0 text-muted-foreground hover:text-foreground"
      onClick={() => void handleClick()}
      aria-label={TOOLTIP_LABEL}
      title={TOOLTIP_LABEL}
    >
      <Share2 className="size-4" aria-hidden />
    </Button>
  );
}
