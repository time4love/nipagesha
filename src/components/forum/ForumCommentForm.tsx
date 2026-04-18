"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createForumComment } from "@/app/forum/actions";

interface ForumCommentFormProps {
  postId: string;
  /** Reply to a top-level comment (validated server-side). */
  parentCommentId?: string | null;
  /** Shown above the field when replying (e.g. "בתשובה ל־…"). */
  replyLabel?: string | null;
  compact?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ForumCommentForm({
  postId,
  parentCommentId,
  replyLabel,
  compact,
  onSuccess,
  onCancel,
}: ForumCommentFormProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = content.trim();
    if (!trimmed) return;
    setPending(true);
    const res = await createForumComment(
      postId,
      trimmed,
      parentCommentId ? { parentCommentId } : undefined
    );
    setPending(false);
    if (!res.success) {
      setError(res.error ?? "שגיאה");
      return;
    }
    setContent("");
    onSuccess?.();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {replyLabel ? (
        <p className="text-sm text-muted-foreground">{replyLabel}</p>
      ) : null}
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="כתבו את תגובתכם..."
        disabled={pending}
        rows={compact ? 3 : 4}
        className={
          compact
            ? "resize-y min-h-[80px]"
            : "resize-y min-h-[100px]"
        }
        aria-label="תוכן התגובה"
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" disabled={pending || !content.trim()}>
          {pending ? "שולח..." : "הגב"}
        </Button>
        {parentCommentId && onCancel ? (
          <Button
            type="button"
            variant="ghost"
            disabled={pending}
            onClick={() => {
              setContent("");
              setError(null);
              onCancel();
            }}
          >
            ביטול
          </Button>
        ) : null}
      </div>
    </form>
  );
}
