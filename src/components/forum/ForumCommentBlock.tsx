"use client";

import { useState } from "react";
import type { ForumCommentWithAuthor } from "@/app/forum/actions";
import { Button } from "@/components/ui/button";
import { ForumCommentForm } from "@/components/forum/ForumCommentForm";
import { ForumCommentItem } from "@/components/forum/ForumCommentItem";

interface ForumCommentBlockProps {
  root: ForumCommentWithAuthor;
  replies: ForumCommentWithAuthor[];
  postId: string;
  currentUserId: string | undefined;
}

export function ForumCommentBlock({
  root,
  replies,
  postId,
  currentUserId,
}: ForumCommentBlockProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const canReply = Boolean(currentUserId);

  return (
    <div className="space-y-3">
      <ForumCommentItem
        comment={root}
        postId={postId}
        currentUserId={currentUserId}
        isReply={false}
      />
      {replies.length > 0 ? (
        <div className="border-s-2 border-border/70 ps-3 space-y-3">
          {replies.map((r) => (
            <ForumCommentItem
              key={r.id}
              comment={r}
              postId={postId}
              currentUserId={currentUserId}
              isReply
            />
          ))}
        </div>
      ) : null}
      {canReply ? (
        <div className="flex flex-col gap-2 pt-1">
          {showReplyForm ? (
            <ForumCommentForm
              postId={postId}
              parentCommentId={root.id}
              replyLabel={`בתשובה ל־${root.author_display_name}`}
              compact
              onSuccess={() => setShowReplyForm(false)}
              onCancel={() => setShowReplyForm(false)}
            />
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start"
              onClick={() => setShowReplyForm(true)}
            >
              הגב לתגובה
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
