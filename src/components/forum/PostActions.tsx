"use client";

import { useCallback, useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/common/ShareButton";
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
  const [isPending, startTransition] = useTransition();

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

      <ShareButton
        title={postTitle}
        text={postTitle}
        url={shareUrl}
        variant="ghost"
        size="sm"
        className="rounded-full text-muted-foreground hover:text-foreground [&_svg]:size-5"
      />
    </div>
  );
}
