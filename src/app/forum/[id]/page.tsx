import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArticleContent } from "@/components/articles/ArticleContent";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ForumPostReportButton } from "@/components/forum/ForumPostReportButton";
import { ForumCommentForm } from "@/components/forum/ForumCommentForm";
import { PostActions } from "@/components/forum/PostActions";
import { getForumCategoryBadgeVariant } from "@/lib/constants";
import {
  extractFirstImageUrlFromHtml,
  formatForumRelativeTime,
  isForumPostEdited,
  resolveForumOgImageUrl,
  stripHtmlToSnippet,
} from "@/lib/forum";
import { getForumPostById, getPostComments } from "../actions";
import { ForumPostActionsMenu } from "@/components/forum/ForumPostActionsMenu";
import { ArrowRight, MessageCircle } from "lucide-react";

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.nipagesha.co.il";

interface ForumPostPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ForumPostPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: post, error } = await supabase
    .from("forum_posts")
    .select("title, content, thumbnail_url")
    .eq("id", id)
    .maybeSingle();

  if (error || !post) {
    return { title: "פוסט בקהילה | ניפגשה" };
  }

  const row = post as { title: string; content: string; thumbnail_url: string | null };
  const description = stripHtmlToSnippet(row.content, 120);
  const imageCandidate = row.thumbnail_url?.trim() || extractFirstImageUrlFromHtml(row.content);
  const ogImage = resolveForumOgImageUrl(imageCandidate, SITE_ORIGIN);
  const pageUrl = `${SITE_ORIGIN}/forum/${id}`;

  return {
    title: `${row.title} | פורום ניפגשה`,
    description,
    openGraph: {
      title: row.title,
      description,
      url: pageUrl,
      type: "article",
      locale: "he_IL",
      siteName: "ניפגשה",
      images: [{ url: ogImage, alt: row.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: row.title,
      description,
      images: [ogImage],
    },
  };
}

export default async function ForumPostPage({ params }: ForumPostPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [post, comments, authRes] = await Promise.all([
    getForumPostById(id),
    getPostComments(id),
    supabase.auth.getUser(),
  ]);

  if (!post) {
    notFound();
  }

  const user = authRes.data.user;

  let reportName: string | undefined;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle();
    const dn = profile?.display_name?.trim();
    reportName = dn || user.email?.split("@")[0] || undefined;
  }

  const reportEmail = user?.email ?? undefined;
  const titleInitial = post.author_display_name.charAt(0) || "?";
  const isOwner = Boolean(user && user.id === post.user_id);
  const showEdited = isForumPostEdited(post.created_at, post.updated_at);

  return (
    <article className="space-y-8" dir="rtl">
      <Link
        href="/forum"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowRight className="size-4 ml-1" aria-hidden />
        חזרה לפורום
      </Link>

      <header className="relative rounded-xl border bg-card text-card-foreground shadow-sm p-6 md:p-8 space-y-4">
        {isOwner ? (
          <div className="absolute left-3 top-3 z-10 md:left-4 md:top-4">
            <ForumPostActionsMenu postId={post.id} postTitle={post.title} />
          </div>
        ) : null}

        <div
          className={`flex flex-wrap items-start gap-3 ${isOwner ? "pl-12 md:pl-14" : ""}`}
        >
          <Badge variant={getForumCategoryBadgeVariant(post.category)}>
            {post.category}
          </Badge>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 ms-auto text-sm text-muted-foreground">
            <MessageCircle className="size-4 shrink-0" aria-hidden />
            <span>{post.comment_count} תגובות</span>
            <span aria-hidden>·</span>
            <time dateTime={post.created_at} className="tabular-nums">
              {formatForumRelativeTime(post.created_at)}
            </time>
            {showEdited ? (
              <span className="text-xs text-muted-foreground/90">(נערך)</span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <h1 className="text-2xl md:text-3xl font-bold leading-tight flex-1 min-w-0">
            {post.title}
          </h1>
          <ForumPostReportButton
            postId={post.id}
            postTitle={post.title}
            initialEmail={reportEmail}
            initialName={reportName}
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Avatar className="h-11 w-11">
            <AvatarImage src={post.author_avatar_url ?? undefined} alt="" />
            <AvatarFallback>{titleInitial}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{post.author_display_name}</p>
          </div>
        </div>

        <div className="pt-2 border-t border-border/80">
          <ArticleContent html={post.content} className="prose-headings:scroll-mt-20" />
        </div>

        <PostActions
          postId={post.id}
          postTitle={post.title}
          shareUrl={`${SITE_ORIGIN}/forum/${post.id}`}
          initialLikeCount={post.like_count}
          initialLiked={post.liked_by_me}
          isAuthenticated={Boolean(user)}
        />
      </header>

      <section aria-labelledby="comments-heading" className="space-y-6">
        <h2 id="comments-heading" className="text-lg font-semibold">
          תגובות ({comments.length})
        </h2>

        {comments.length === 0 ? (
          <p className="text-muted-foreground text-sm">אין תגובות עדיין — התחילו את הדיון.</p>
        ) : (
          <ul className="space-y-0 list-none p-0 m-0 divide-y divide-border rounded-xl border bg-muted/20">
            {comments.map((c) => {
              const initial = c.author_display_name.charAt(0) || "?";
              return (
                <li key={c.id} className="p-4 md:p-5">
                  <div className="flex gap-3">
                    <Avatar className="h-9 w-9 shrink-0 mt-0.5">
                      <AvatarImage src={c.author_avatar_url ?? undefined} alt="" />
                      <AvatarFallback className="text-xs">{initial}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="font-medium text-sm">{c.author_display_name}</span>
                        <time
                          dateTime={c.created_at}
                          className="text-xs text-muted-foreground tabular-nums"
                        >
                          {formatForumRelativeTime(c.created_at)}
                        </time>
                      </div>
                      <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                        {c.content}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="rounded-xl border bg-card p-4 md:p-6 space-y-3">
          {user ? (
            <>
              <h3 className="text-base font-medium">הוספת תגובה</h3>
              <ForumCommentForm postId={post.id} />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              <Link
                href={`/login?redirect=${encodeURIComponent(`/forum/${id}`)}`}
                className="text-primary font-medium underline-offset-4 hover:underline"
              >
                יש להתחבר כדי להגיב
              </Link>
            </p>
          )}
        </div>
      </section>
    </article>
  );
}
