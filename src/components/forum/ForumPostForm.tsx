"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { useForm, useWatch, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createForumPost, updateForumPost } from "@/app/forum/actions";
import { ArticleContent } from "@/components/articles/ArticleContent";
import { FacebookEmbed } from "@/components/forum/FacebookEmbed";
import { hasHtmlContent } from "@/lib/child-card";
import {
  forumPostEditorSchema,
  type ForumPostEditorFormValues,
  isForumPreviewEmpty,
} from "@/lib/forum/forum-post-editor-schema";
import { parseOptionalFacebookLink } from "@/lib/forum/facebook-link";
import { DEFAULT_FORUM_CATEGORY } from "@/lib/constants";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

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

export interface ForumPostFormProps {
  mode: "create" | "edit";
  postId?: string;
  initialTitle?: string;
  initialContent?: string;
  initialFacebookLink?: string;
  backHref: string;
  backLabel: string;
}

function ForumPostLivePreview({
  title,
  content,
  facebookRaw,
}: {
  title: string;
  content: string;
  facebookRaw: string;
}) {
  if (isForumPreviewEmpty(title, content, facebookRaw)) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        התצוגה המקדימה תופיע כאן...
      </p>
    );
  }

  const fb = parseOptionalFacebookLink(facebookRaw);
  const embedUrl = fb.ok && fb.value ? fb.value : null;

  return (
    <div
      className="space-y-4 rounded-xl border bg-card p-6 text-right shadow-sm"
      dir="rtl"
    >
      {title.trim().length > 0 ? (
        <h2 className="text-2xl font-bold leading-tight text-foreground">{title}</h2>
      ) : null}
      {hasHtmlContent(content) ? (
        <ArticleContent html={content} className="prose-headings:scroll-mt-20" />
      ) : null}
      {embedUrl ? <FacebookEmbed url={embedUrl} /> : null}
    </div>
  );
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
  const [tab, setTab] = useState("edit");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<ForumPostEditorFormValues>({
    resolver: zodResolver(forumPostEditorSchema),
    defaultValues: {
      title: initialTitle,
      content: initialContent,
      facebook_link: initialFacebookLink,
    },
  });

  useEffect(() => {
    form.reset({
      title: initialTitle,
      content: initialContent,
      facebook_link: initialFacebookLink,
    });
  }, [form, initialTitle, initialContent, initialFacebookLink, postId]);

  const watchedTitle = useWatch({ control: form.control, name: "title" });
  const watchedContent = useWatch({ control: form.control, name: "content" });
  const watchedFacebook = useWatch({ control: form.control, name: "facebook_link" });

  function onInvalid(errors: FieldErrors<ForumPostEditorFormValues>) {
    const first =
      errors.title?.message ??
      errors.content?.message ??
      errors.facebook_link?.message;
    toast.error(typeof first === "string" ? first : "נא לתקן את השדות.");
  }

  async function onSubmit(values: ForumPostEditorFormValues) {
    setSubmitError(null);
    const fbParsed = parseOptionalFacebookLink(values.facebook_link);
    const facebookLinkValue = fbParsed.ok ? fbParsed.value : null;
    if (!fbParsed.ok) {
      setSubmitError(fbParsed.error);
      return;
    }

    try {
      if (mode === "create") {
        const res = await createForumPost({
          title: values.title,
          category: DEFAULT_FORUM_CATEGORY,
          content: values.content,
          facebook_link: facebookLinkValue,
        });
        if (!res.success) {
          setSubmitError(res.error ?? "שמירה נכשלה.");
        }
      } else {
        if (!postId) {
          setSubmitError("מזהה פוסט חסר.");
          return;
        }
        const res = await updateForumPost(postId, {
          title: values.title,
          category: DEFAULT_FORUM_CATEGORY,
          content: values.content,
          facebook_link: facebookLinkValue,
        });
        if (!res.success) {
          setSubmitError(res.error ?? "שמירה נכשלה.");
          return;
        }
        router.push(`/forum/${postId}`);
        router.refresh();
      }
    } catch (err) {
      if (isRedirectError(err)) {
        return;
      }
      setSubmitError(mode === "create" ? "שמירה נכשלה." : "עדכון נכשל.");
    }
  }

  const pending = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        className="max-w-3xl space-y-6"
        dir="rtl"
      >
        <Link
          href={backHref}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowRight className="ml-1 size-4" aria-hidden />
          {backLabel}
        </Link>

        {submitError ? (
          <div
            className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            {submitError}
          </div>
        ) : null}

        <Tabs value={tab} onValueChange={setTab} className="w-full space-y-4" dir="rtl">
          <TabsList className="grid h-auto w-full max-w-md grid-cols-2 gap-1 p-1">
            <TabsTrigger value="edit" type="button" className="w-full">
              עריכה
            </TabsTrigger>
            <TabsTrigger value="preview" type="button" className="w-full">
              תצוגה מקדימה
            </TabsTrigger>
          </TabsList>

          <div
            role="tabpanel"
            id="forum-post-tab-edit"
            hidden={tab !== "edit"}
            className="space-y-6"
            aria-hidden={tab !== "edit"}
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="forum-title">כותרת *</FormLabel>
                  <FormControl>
                    <Input
                      id="forum-title"
                      placeholder="כותרת הפוסט (למשל: כתבה מעניינת שראיתי...)"
                      disabled={pending}
                      maxLength={500}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>תוכן הפוסט (אופציונלי אם צורף קישור)</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      mode="public"
                      disabled={pending}
                      placeholder="שתפו את הסיפור שלכם. ניתן להוסיף עיצוב, רשימות ותמונות."
                      onUploadError={(msg) => toast.error(msg)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="facebook_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="forum-facebook-link">
                    קישור לפוסט בפייסבוק (אופציונלי)
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="forum-facebook-link"
                      type="url"
                      inputMode="url"
                      autoComplete="url"
                      placeholder="https://www.facebook.com/..."
                      disabled={pending}
                      className="text-left"
                      dir="ltr"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    הדבק כאן קישור לפייסבוק. הפוסט יוצג אוטומטית למטה בתצוגה המקדימה.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div
            role="tabpanel"
            id="forum-post-tab-preview"
            hidden={tab !== "preview"}
            aria-hidden={tab !== "preview"}
          >
            <ForumPostLivePreview
              title={watchedTitle ?? ""}
              content={watchedContent ?? ""}
              facebookRaw={watchedFacebook ?? ""}
            />
          </div>
        </Tabs>

        <div className="flex flex-wrap gap-3 pt-2">
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
    </Form>
  );
}
