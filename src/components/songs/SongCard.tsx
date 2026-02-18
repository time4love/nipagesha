"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { YouTubePlayer } from "./YouTubePlayer";
import type { Song } from "@/app/(marketing)/songs/actions";
import { MessageCircle } from "lucide-react";
import Link from "next/link";

interface SongCardProps {
  song: Song;
  onRequestSong?: () => void;
}

export function SongCard({ song, onRequestSong }: SongCardProps) {
  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHeader className="pb-2">
        <YouTubePlayer
          url={song.youtube_url}
          title={song.title}
          className="w-full"
        />
        <div className="pt-3 text-right">
          <h2 className="text-lg font-semibold text-foreground">{song.title}</h2>
          {song.artist_name ? (
            <p className="text-sm text-muted-foreground">{song.artist_name}</p>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        <Accordion type="single" collapsible dir="rtl" className="w-full">
          <AccordionItem value="lyrics" className="border-none">
            <AccordionTrigger className="py-2 text-sm hover:no-underline hover:bg-muted/50 rounded-md px-2 -mx-2">
              מילות השיר
            </AccordionTrigger>
            <AccordionContent className="px-2">
              <pre
                className="whitespace-pre-wrap font-sans text-foreground text-sm leading-relaxed break-words"
                dir="rtl"
              >
                {song.lyrics?.trim() || "אין מילים זמינות."}
              </pre>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      <CardFooter className="pt-0">
        {onRequestSong ? (
          <Button
            onClick={onRequestSong}
            variant="outline"
            className="w-full gap-2"
            asChild
          >
            <Link href="/#cta-heading" className="inline-flex items-center gap-2">
              <MessageCircle className="size-4" aria-hidden />
              אני רוצה שיר כזה
            </Link>
          </Button>
        ) : (
          <Button variant="outline" className="w-full gap-2" asChild>
            <Link href="/#cta-heading" className="inline-flex items-center gap-2">
              <MessageCircle className="size-4" aria-hidden />
              אני רוצה שיר כזה
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
