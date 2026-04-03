"use client";

import { useCallback, useState, useTransition } from "react";
import { Heart, Share2, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { togglePostLike } from "@/app/forum/actions";
import { cn } from "@/lib/utils";

interface PostActionsProps {
  postId: string;
  postTitle: string;
  shareUrl: string;
  initialLikeCount: number;
  initialLiked: boolean;
  isAuthenticated: boolean;
}

export function PostActions({
  postId,
  postTitle,
  shareUrl,
  initialLikeCount,
  initialLiked,
  isAuthenticated,
}: PostActionsProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [likeBurst, setLikeBurst] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const canNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  const triggerLikeAnimation = useCallback(() => {
    setLikeBurst(true);
    window.setTimeout(() => setLikeBurst(false), 420);
  }, []);

  const handleLike = () => {
    if (!isAuthenticated) {
      toast.info("יש להתחבר כדי לסמן לייק.", {
        description: "התחברו וחזרו לפוסט כדי להצביע.",
      });
      return;
    }

    startTransition(async () => {
      const result = await togglePostLike(postId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setLiked(result.liked);
      setLikeCount(result.likeCount);
      triggerLikeAnimation();
    });
  };

  const handleShareButtonClick = async () => {
    if (canNativeShare) {
      try {
        await navigator.share({
          title: postTitle,
          text: postTitle,
          url: shareUrl,
        });
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

  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${postTitle} ${shareUrl}`)}`;

  const openExternal = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
    setShareOpen(false);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("הקישור הועתק.");
      setShareOpen(false);
    } catch {
      toast.error("לא ניתן להעתיק את הקישור.");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border/80" dir="rtl">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={isPending}
        onClick={handleLike}
        className={cn(
          "gap-2 rounded-full transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          likeBurst && "scale-125",
          liked
            ? "text-teal-600 hover:text-teal-700 hover:bg-teal-500/10"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-pressed={liked}
        aria-label={liked ? "ביטול לייק" : "לייק לפוסט"}
      >
        <Heart
          className={cn(
            "size-5 shrink-0 transition-colors",
            liked && "fill-teal-600 text-teal-600"
          )}
          aria-hidden
        />
        <span className="tabular-nums font-medium">{likeCount}</span>
      </Button>

      <Popover open={shareOpen} onOpenChange={setShareOpen}>
        <PopoverAnchor asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-2 rounded-full text-muted-foreground hover:text-foreground"
            onClick={() => void handleShareButtonClick()}
            aria-label="שיתוף הפוסט"
            aria-expanded={shareOpen}
            aria-haspopup="dialog"
          >
            <Share2 className="size-5 shrink-0" aria-hidden />
            שיתוף
          </Button>
        </PopoverAnchor>
        <PopoverContent
          dir="rtl"
          align="end"
          className="w-56 p-2 space-y-0.5"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">שיתוף</p>
          <button
            type="button"
            className="flex w-full items-center rounded-md px-2 py-2 text-sm hover:bg-accent text-start"
            onClick={() => openExternal(facebookUrl)}
          >
            שיתוף לפייסבוק
          </button>
          <button
            type="button"
            className="flex w-full items-center rounded-md px-2 py-2 text-sm hover:bg-accent text-start"
            onClick={() => openExternal(whatsappUrl)}
          >
            שיתוף לוואטסאפ
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent text-start"
            onClick={() => void copyLink()}
          >
            <Link2 className="size-4 shrink-0 opacity-70" aria-hidden />
            העתקת קישור
          </button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
