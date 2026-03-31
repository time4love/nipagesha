"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createForumComment } from "@/app/forum/actions";

interface ForumCommentFormProps {
  postId: string;
}

export function ForumCommentForm({ postId }: ForumCommentFormProps) {
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
    const res = await createForumComment(postId, trimmed);
    setPending(false);
    if (!res.success) {
      setError(res.error ?? "שגיאה");
      return;
    }
    setContent("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
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
        rows={4}
        className="resize-y min-h-[100px]"
        aria-label="תוכן התגובה"
      />
      <Button type="submit" disabled={pending || !content.trim()}>
        {pending ? "שולח..." : "הגב"}
      </Button>
    </form>
  );
}
