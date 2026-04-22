"use client";

import { useState } from "react";
import { Share2, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
  /** Optional preview (e.g. YouTube thumbnail) — shown in the share menu; link previews use page OG tags. */
  previewImageUrl?: string | null;
  /** Visible label (Hebrew UI). */
  label?: string;
  variant?: "ghost" | "outline";
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function ShareButton({
  title,
  text,
  url,
  previewImageUrl,
  label = "שיתוף",
  variant = "ghost",
  size = "sm",
  className,
}: ShareButtonProps) {
  const [shareOpen, setShareOpen] = useState(false);

  const canNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  const handleShareButtonClick = async () => {
    if (canNativeShare) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err) {
        const e = err as { name?: string };
        if (e?.name === "AbortError") return;
        setShareOpen(true);
        return;
      }
    }
    setShareOpen((o) => !o);
  };

  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} ${url}`)}`;

  const openExternal = (href: string) => {
    window.open(href, "_blank", "noopener,noreferrer");
    setShareOpen(false);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("הקישור הועתק.");
      setShareOpen(false);
    } catch {
      toast.error("לא ניתן להעתיק את הקישור.");
    }
  };

  return (
    <Popover open={shareOpen} onOpenChange={setShareOpen}>
      <PopoverAnchor asChild>
        <Button
          type="button"
          variant={variant}
          size={size}
          className={cn("gap-2", className)}
          onClick={() => void handleShareButtonClick()}
          aria-label={label}
          aria-expanded={shareOpen}
          aria-haspopup="dialog"
          suppressHydrationWarning
        >
          <Share2 className="size-4 shrink-0" aria-hidden />
          {label}
        </Button>
      </PopoverAnchor>
      <PopoverContent
        dir="rtl"
        align="end"
        className="w-64 p-0 overflow-hidden"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {previewImageUrl ? (
          <div className="relative aspect-video w-full bg-muted">
            <img
              src={previewImageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}
        <div className="p-2 space-y-0.5">
        <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">שיתוף</p>
        {previewImageUrl ? (
          <p className="px-2 pb-1 text-[11px] leading-snug text-muted-foreground">
            תמונת יוטיוב: מוצגת לעיתים כתצוגה מקדימה בוואטסאפ/פייסבוק.
          </p>
        ) : null}
        <button
          type="button"
          className="flex w-full items-center rounded-md px-2 py-2 text-sm hover:bg-accent text-start"
          onClick={() => openExternal(whatsappUrl)}
        >
          שיתוף לוואטסאפ
        </button>
        <button
          type="button"
          className="flex w-full items-center rounded-md px-2 py-2 text-sm hover:bg-accent text-start"
          onClick={() => openExternal(facebookUrl)}
        >
          שיתוף לפייסבוק
        </button>
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent text-start"
          onClick={() => void copyLink()}
        >
          <Link2 className="size-4 shrink-0 opacity-70" aria-hidden />
          העתקת קישור
        </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
