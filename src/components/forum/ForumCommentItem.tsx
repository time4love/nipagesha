"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ForumCommentWithAuthor } from "@/app/forum/actions";
import { formatForumRelativeTime, isForumCommentEdited } from "@/lib/forum";
import { ForumCommentDeleteButton } from "@/components/forum/ForumCommentDeleteButton";
import { ForumCommentEditDialog } from "@/components/forum/ForumCommentEditDialog";

interface ForumCommentItemProps {
  comment: ForumCommentWithAuthor;
  postId: string;
  currentUserId: string | undefined;
  isReply: boolean;
  /** Logged-in viewer is a site admin (may delete any comment on this post). */
  isAdminViewer?: boolean;
}

export function ForumCommentItem({
  comment: c,
  postId,
  currentUserId,
  isReply,
  isAdminViewer,
}: ForumCommentItemProps) {
  const initial = c.author_display_name.charAt(0) || "?";
  const isOwner = Boolean(currentUserId && currentUserId === c.user_id);
  const showEdit = isOwner;
  const showDelete = isOwner || Boolean(isAdminViewer);
  const moderationDelete = Boolean(isAdminViewer && !isOwner);

  return (
    <div className="flex gap-3">
      <Avatar
        className={`shrink-0 mt-0.5 ${isReply ? "h-8 w-8" : "h-9 w-9"}`}
      >
        <AvatarImage src={c.author_avatar_url ?? undefined} alt="" />
        <AvatarFallback className="text-xs">{initial}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 space-y-1">
        {isReply && c.parent_author_display_name ? (
          <p className="text-[11px] text-muted-foreground leading-snug">
            בתשובה ל־
            <span className="font-medium text-foreground/90">
              {c.parent_author_display_name}
            </span>
          </p>
        ) : null}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-baseline gap-2 min-w-0">
            <span className="font-medium text-sm">{c.author_display_name}</span>
            <time
              dateTime={c.created_at}
              className="text-xs text-muted-foreground tabular-nums"
            >
              {formatForumRelativeTime(c.created_at)}
            </time>
            {isForumCommentEdited(c.created_at, c.updated_at) ? (
              <span className="text-[11px] text-muted-foreground/90">(נערך)</span>
            ) : null}
          </div>
          {showEdit || showDelete ? (
            <div className="flex shrink-0 items-center gap-0.5">
              {showEdit ? (
                <ForumCommentEditDialog
                  commentId={c.id}
                  postId={postId}
                  initialContent={c.content}
                />
              ) : null}
              {showDelete ? (
                <ForumCommentDeleteButton
                  commentId={c.id}
                  postId={postId}
                  moderation={moderationDelete}
                />
              ) : null}
            </div>
          ) : null}
        </div>
        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
          {c.content}
        </p>
      </div>
    </div>
  );
}
