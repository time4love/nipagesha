"use client";

import { useState, useCallback } from "react";

export interface UseInfiniteScrollFetchResult<T> {
  data: T[];
  hasMore: boolean;
}

export interface UseInfiniteScrollOptions<T> {
  initialData: T[];
  initialHasMore: boolean;
  fetchAction: (
    offset: number,
    limit: number
  ) => Promise<UseInfiniteScrollFetchResult<T>>;
  limit: number;
}

export interface UseInfiniteScrollReturn<T> {
  items: T[];
  loadMore: () => Promise<void>;
  hasMore: boolean;
  isLoading: boolean;
}

/**
 * Generic hook for infinite scroll: manages a list that grows when loadMore() is called.
 * Server returns { data, hasMore }; new data is appended to items.
 */
export function useInfiniteScroll<T>({
  initialData,
  initialHasMore,
  fetchAction,
  limit,
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollReturn<T> {
  const [items, setItems] = useState<T[]>(initialData);
  const [offset, setOffset] = useState(initialData.length);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    setIsLoading(true);
    try {
      const result = await fetchAction(offset, limit);
      setItems((prev) => [...prev, ...result.data]);
      setOffset((prev) => prev + result.data.length);
      setHasMore(result.hasMore);
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, isLoading, offset, limit, fetchAction]);

  return { items, loadMore, hasMore, isLoading };
}
