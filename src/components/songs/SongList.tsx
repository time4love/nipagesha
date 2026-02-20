"use client";

import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { getSongs, type Song } from "@/app/(marketing)/songs/actions";
import { SongCard } from "./SongCard";
import { InfiniteScrollTrigger } from "@/components/ui/infinite-scroll-trigger";

interface SongListProps {
  initialData: Song[];
  initialHasMore: boolean;
}

const LIMIT = 10;

export function SongList({ initialData, initialHasMore }: SongListProps) {
  const { items, loadMore, hasMore, isLoading } = useInfiniteScroll({
    initialData,
    initialHasMore,
    fetchAction: getSongs,
    limit: LIMIT,
  });

  return (
    <>
      <ul
        className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 list-none p-0 m-0"
        aria-label="רשימת שירים"
      >
        {items.map((song) => (
          <li
            key={song.id}
            className="animate-in fade-in duration-300 ease-out"
          >
            <SongCard song={song} />
          </li>
        ))}
      </ul>
      <InfiniteScrollTrigger
        onLoadMore={loadMore}
        hasMore={hasMore}
        isLoading={isLoading}
        showEndMessage={items.length > 0}
        endMessage="סוף הרשימה"
      />
    </>
  );
}
