"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { createForumPost, updateForumPost } from "@/app/forum/actions";

const RichTextEditor = dynamic(
  () =>
    import("@/components/editor/RichTextEditor").then((m) => m.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="min-h-[200px] w-full rounded-md" aria-hidden />
    ),
  }
);
import { DEFAULT_FORUM_CATEGORY } from "@/lib/constants";
import { forumPostFacebookLinkFieldSchema } from "@/lib/forum/facebook-link";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

export interface ForumPostFormProps {
  mode: "create" | "edit";
  postId?: string;
  initialTitle?: string;
  initialContent?: string;
  initialFacebookLink?: string;
  backHref: string;
  backLabel: string;
}

export function ForumPostForm({
  mode,
  postId,
  initialTitle = "",
  initialContent = "",
  initialFacebookLink = "",
  backHref,
  backLabel,
}: ForumPostFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [facebookLink, setFacebookLink] = useState(initialFacebookLink);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const fbParsed = forumPostFacebookLinkFieldSchema.safeParse(facebookLink);
    if (!fbParsed.success) {
      const msg = fbParsed.error.issues[0]?.message ?? "קישור פייסבוק לא תקין.";
      setError(msg);
      return;
    }
    const facebookLinkValue = fbParsed.data;

    setPending(true);
    try {
      if (mode === "create") {
        const res = await createForumPost({
          title,
          category: DEFAULT_FORUM_CATEGORY,
          content,
          facebook_link: facebookLinkValue,
        });
        if (!res.success) {
          setError(res.error ?? "שמירה נכשלה.");
        }
      } else {
        if (!postId) {
          setError("מזהה פוסט חסר.");
          return;
        }
        const res = await updateForumPost(postId, {
          title,
          category: DEFAULT_FORUM_CATEGORY,
          content,
          facebook_link: facebookLinkValue,
        });
        if (!res.success) {
          setError(res.error ?? "שמירה נכשלה.");
          return;
        }
        router.push(`/forum/${postId}`);
        router.refresh();
      }
    } catch (err) {
      if (isRedirectError(err)) {
        return;
      }
      setError(mode === "create" ? "שמירה נכשלה." : "עדכון נכשל.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl" dir="rtl">
      <Link
        href={backHref}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowRight className="size-4 ml-1" aria-hidden />
        {backLabel}
      </Link>

      {error ? (
        <div
          className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="forum-title">כותרת *</Label>
        <Input
          id="forum-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="כותרת ברורה לפוסט"
          required
          disabled={pending}
          maxLength={500}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="forum-content">תוכן *</Label>
        <RichTextEditor
          value={content}
          onChange={setContent}
          mode="public"
          disabled={pending}
          placeholder="שתפו את הסיפור שלכם. ניתן להוסיף עיצוב, רשימות ותמונות."
          onUploadError={(msg) => toast.error(msg)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="forum-facebook-link">קישור לפוסט בפייסבוק (אופציונלי)</Label>
        <Input
          id="forum-facebook-link"
          type="url"
          inputMode="url"
          autoComplete="url"
          value={facebookLink}
          onChange={(e) => setFacebookLink(e.target.value)}
          placeholder="https://www.facebook.com/..."
          disabled={pending}
          className="text-left"
          dir="ltr"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending} size="lg">
          {pending
            ? mode === "create"
              ? "מפרסם..."
              : "שומר..."
            : mode === "create"
              ? "פרסמו פוסט"
              : "שמור שינויים"}
        </Button>
        <Button type="button" variant="outline" asChild disabled={pending}>
          <Link href={backHref}>ביטול</Link>
        </Button>
      </div>
    </form>
  );
}
