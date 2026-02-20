"use client";

import { useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";

interface InfiniteScrollTriggerProps {
  onLoadMore: () => void | Promise<void>;
  hasMore: boolean;
  isLoading: boolean;
  /** Optional: show "End of list" when !hasMore && !isLoading */
  showEndMessage?: boolean;
  endMessage?: string;
}

/**
 * Renders a sentinel element at the bottom of a list. When it enters the viewport
 * and hasMore && !isLoading, calls onLoadMore(). Shows a spinner while loading.
 */
export function InfiniteScrollTrigger({
  onLoadMore,
  hasMore,
  isLoading,
  showEndMessage = true,
  endMessage = "סוף הרשימה",
}: InfiniteScrollTriggerProps) {
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });
  const loadingTriggered = useRef(false);

  useEffect(() => {
    if (inView && hasMore && !isLoading && !loadingTriggered.current) {
      loadingTriggered.current = true;
      void Promise.resolve(onLoadMore()).finally(() => {
        loadingTriggered.current = false;
      });
    }
  }, [inView, hasMore, isLoading, onLoadMore]);

  if (!hasMore && !isLoading) {
    return showEndMessage ? (
      <p
        className="py-6 text-center text-sm text-muted-foreground"
        aria-hidden
      >
        {endMessage}
      </p>
    ) : null;
  }

  return (
    <div
      ref={ref}
      className="flex min-h-[80px] items-center justify-center py-4"
      aria-live="polite"
      aria-busy={isLoading}
    >
      {isLoading ? (
        <Loader2
          className="size-8 animate-spin text-muted-foreground"
          aria-hidden
        />
      ) : null}
    </div>
  );
}
