"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { getForumPosts, type ForumPostListItem } from "@/app/forum/actions";
import { ForumPostCard } from "@/components/forum/ForumPostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

interface ForumFeedClientProps {
  initialPosts: ForumPostListItem[];
  initialHasMore: boolean;
  currentUserId: string | null;
}

function ForumFeedSkeletonRow() {
  return (
    <div
      className="flex flex-col gap-4 rounded-xl border border-border/80 bg-card p-4 shadow-sm sm:flex-row sm:items-stretch sm:gap-5"
      dir="rtl"
    >
      <Skeleton className="mx-auto h-28 w-full max-w-[7rem] shrink-0 rounded-lg sm:mx-0 sm:h-32 sm:w-32" />
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="ms-auto h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-[85%]" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center gap-2 pt-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
    </div>
  );
}

export function ForumFeedClient({
  initialPosts,
  initialHasMore,
  currentUserId,
}: ForumFeedClientProps) {
  const [posts, setPosts] = useState<ForumPostListItem[]>(initialPosts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const loadGuardRef = useRef(false);

  useEffect(() => {
    setPosts(initialPosts);
    setHasMore(initialHasMore);
    loadGuardRef.current = false;
  }, [initialPosts, initialHasMore]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadGuardRef.current) return;
    loadGuardRef.current = true;
    setIsLoading(true);
    const offset = posts.length;
    try {
      const { data, hasMore: nextHasMore } = await getForumPosts(
        null,
        offset,
        PAGE_SIZE
      );
      setPosts((prev) => {
        const existing = new Set(prev.map((p) => p.id));
        const merged = [...prev];
        for (const row of data) {
          if (!existing.has(row.id)) merged.push(row);
        }
        return merged;
      });
      setHasMore(nextHasMore);
    } finally {
      loadGuardRef.current = false;
      setIsLoading(false);
    }
  }, [hasMore, posts.length]);

  const { ref: loadMoreRef, inView } = useInView({
    rootMargin: "240px 0px",
    threshold: 0,
  });

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      void loadMore();
    }
  }, [inView, hasMore, isLoading, loadMore]);

  return (
    <div className="space-y-4">
      <ul className="list-none space-y-4 p-0 m-0">
        {posts.map((post) => (
          <li key={post.id}>
            <ForumPostCard post={post} currentUserId={currentUserId} />
          </li>
        ))}
      </ul>

      <div
        ref={loadMoreRef}
        className={cn(
          "flex min-h-12 flex-col items-center justify-center gap-3 py-4",
          !hasMore && posts.length > 0 && "min-h-0 py-2"
        )}
        aria-hidden={!hasMore && !isLoading}
      >
        {isLoading && (
          <div className="w-full space-y-4">
            <ForumFeedSkeletonRow />
            <ForumFeedSkeletonRow />
          </div>
        )}
        {!hasMore && posts.length > 0 && (
          <p className="text-center text-xs text-muted-foreground">סוף הפיד</p>
        )}
      </div>
    </div>
  );
}
