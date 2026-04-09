"use client";

import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, ImageIcon } from "lucide-react";
import { getForumCategoryBadgeVariant } from "@/lib/constants";
import { stripHtmlToSnippet, formatForumRelativeTime, isForumPostEdited } from "@/lib/forum";
import type { ForumPostListItem } from "@/app/forum/actions";
import { cn } from "@/lib/utils";
import { ForumPostActionsMenu } from "@/components/forum/ForumPostActionsMenu";

interface ForumPostCardProps {
  post: ForumPostListItem;
  currentUserId: string | null;
}

export function ForumPostCard({ post, currentUserId }: ForumPostCardProps) {
  const initial = post.author_display_name.charAt(0) || "?";
  const snippet = stripHtmlToSnippet(post.content);
  const thumb = post.thumbnail_url;
  const isOwner = Boolean(currentUserId && currentUserId === post.user_id);
  const showEdited = isForumPostEdited(post.created_at, post.updated_at);

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-teal-100/70 bg-gradient-to-br from-card via-card to-teal-50/30",
        "dark:border-teal-900/45 dark:to-teal-950/20",
        "shadow-sm transition-all duration-200 hover:border-teal-200/90 hover:shadow-md",
        "dark:hover:border-teal-800/60"
      )}
      dir="rtl"
    >
      {isOwner ? (
        <div
          className="absolute left-3 top-3 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <ForumPostActionsMenu
            postId={post.id}
            postTitle={post.title}
            triggerClassName="bg-background/95 shadow-sm ring-1 ring-border/70 backdrop-blur-sm"
          />
        </div>
      ) : null}

      <Link
        href={`/forum/${post.id}`}
        className={cn("block group", isOwner && "pl-12")}
      >
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch sm:gap-5 sm:p-5">
          <div className="flex justify-center sm:block sm:shrink-0">
            {thumb ? (
              <div className="relative h-28 w-28 overflow-hidden rounded-lg bg-muted ring-1 ring-black/5 dark:ring-white/10 sm:h-32 sm:w-32">
                <Image
                  src={thumb}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 112px, 128px"
                />
              </div>
            ) : (
              <div
                className={cn(
                  "flex h-28 w-28 items-center justify-center rounded-lg sm:h-32 sm:w-32",
                  "bg-teal-100/80 text-teal-700/80 dark:bg-teal-950/50 dark:text-teal-300/80"
                )}
                aria-hidden
              >
                <ImageIcon className="size-10 opacity-80" />
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-3 text-right">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={getForumCategoryBadgeVariant(post.category)}
                className="font-normal"
              >
                {post.category}
              </Badge>
              {post.facebook_link ? (
                <Badge variant="secondary" className="font-normal gap-1 text-xs">
                  <span aria-hidden>🔗</span>
                  מכיל פוסט פייסבוק
                </Badge>
              ) : null}
              <span className="text-xs text-muted-foreground tabular-nums ms-auto sm:ms-0 flex flex-wrap items-center justify-end gap-1.5">
                <time dateTime={post.created_at}>
                  {formatForumRelativeTime(post.created_at)}
                </time>
                {showEdited ? (
                  <span className="text-[11px] text-muted-foreground/90">(נערך)</span>
                ) : null}
              </span>
            </div>

            <h2 className="text-lg font-semibold leading-snug tracking-tight text-foreground group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
              {post.title}
            </h2>

            <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
              {snippet}
            </p>

            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-3">
              <div className="flex min-w-0 items-center gap-2">
                <Avatar className="h-9 w-9 shrink-0 ring-2 ring-background">
                  <AvatarImage src={post.author_avatar_url ?? undefined} alt="" />
                  <AvatarFallback className="bg-teal-100 text-teal-800 text-xs dark:bg-teal-900 dark:text-teal-100">
                    {initial}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate text-sm font-medium text-foreground/90">
                  {post.author_display_name}
                </span>
              </div>
              <div
                className="flex items-center gap-1.5 text-muted-foreground shrink-0 text-sm"
                aria-label={`${post.comment_count} תגובות`}
              >
                <MessageCircle className="size-4" aria-hidden />
                <span className="tabular-nums">{post.comment_count}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
}
