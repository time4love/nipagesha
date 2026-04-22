"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { getYouTubeThumbnailUrl } from "@/lib/youtube";
import type { SongListItem } from "@/app/(marketing)/songs/actions";
import { MessageCircle, ChevronLeft } from "lucide-react";

interface SongCardProps {
  song: SongListItem;
}

function songContactHref(song: SongListItem): string {
  const params = new URLSearchParams({
    category: "song_request",
    reference_id: song.id,
    reference_type: "song",
    song_title: song.title,
  });
  return `/contact?${params.toString()}`;
}

export function SongCard({ song }: SongCardProps) {
  const thumb = getYouTubeThumbnailUrl(song.youtube_url, "hq");

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <Link
        href={`/songs/${song.id}`}
        className="group block min-h-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-t-xl"
        aria-label={`${song.title} — לעמוד השיר`}
      >
        <div className="relative aspect-video w-full bg-muted">
          {thumb ? (
            <Image
              src={thumb}
              alt=""
              fill
              className="object-cover transition group-hover:opacity-95"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm"
              role="img"
              aria-label="ללא תצוגה מקדימה"
            >
              ללא תצוגה מקדימה
            </div>
          )}
          <div
            className="pointer-events-none absolute inset-0 flex items-end justify-start bg-gradient-to-t from-black/60 to-transparent p-3"
            aria-hidden
          >
            <span className="flex items-center gap-1 text-sm font-medium text-white">
              <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden />
              לצפייה, מילים וסרטון
            </span>
          </div>
        </div>
        <CardHeader className="pb-2 text-right">
          <h2 className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
            {song.title}
          </h2>
          {song.artist_name ? (
            <p className="text-sm text-muted-foreground">{song.artist_name}</p>
          ) : null}
        </CardHeader>
      </Link>
      <CardFooter className="mt-auto pt-0">
        <Button variant="outline" className="w-full gap-2" asChild>
          <Link
            href={songContactHref(song)}
            className="inline-flex items-center justify-center gap-2"
          >
            <MessageCircle className="size-4" aria-hidden />
            אני רוצה שיר כזה
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
