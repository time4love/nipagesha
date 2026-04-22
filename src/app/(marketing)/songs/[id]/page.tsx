import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { YouTubePlayer } from "@/components/songs/YouTubePlayer";
import { ShareButton } from "@/components/common/ShareButton";
import { getPublishedSongById } from "../actions";
import { getYouTubeThumbnailUrl } from "@/lib/youtube";
import { MessageCircle, ArrowRight } from "lucide-react";

export const revalidate = 3600;

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.nipagesha.co.il";

function contactHref(song: { id: string; title: string }): string {
  return `/contact?${new URLSearchParams({
    category: "song_request",
    reference_id: song.id,
    reference_type: "song",
    song_title: song.title,
  }).toString()}`;
}

function lyricsSnippet(lyrics: string | null, title: string): string {
  const t = lyrics?.trim();
  if (t) return t.length > 180 ? `${t.slice(0, 180)}…` : t;
  return `שיר: ${title} | ניפגשה`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const song = await getPublishedSongById(id);
  if (!song) {
    return { title: "שיר | ניפגשה" };
  }

  const description = lyricsSnippet(song.lyrics, song.title);
  const pageUrl = `${SITE_ORIGIN}/songs/${song.id}`;
  // hq (480×360) exists for every YouTube video; maxres can 404 and break link previews.
  const ogThumb = getYouTubeThumbnailUrl(song.youtube_url, "hq");

  return {
    title: `${song.title} | שירי הורים | ניפגשה`,
    description,
    openGraph: {
      title: song.title,
      description,
      url: pageUrl,
      type: "website",
      locale: "he_IL",
      siteName: "ניפגשה",
      ...(ogThumb
        ? {
            images: [
              {
                url: ogThumb,
                width: 480,
                height: 360,
                alt: song.title,
              },
            ],
          }
        : undefined),
    },
    twitter: {
      card: ogThumb ? "summary_large_image" : "summary",
      title: song.title,
      description,
      ...(ogThumb ? { images: [ogThumb] } : undefined),
    },
  };
}

export default async function SongPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const song = await getPublishedSongById(id);
  if (!song) notFound();

  const shareUrl = `${SITE_ORIGIN}/songs/${song.id}`;
  const shareText = lyricsSnippet(song.lyrics, song.title);
  const sharePreviewImage = getYouTubeThumbnailUrl(song.youtube_url, "hq");

  return (
    <div className="min-h-screen" dir="rtl">
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-3xl">
        <Button variant="ghost" size="sm" asChild className="mb-6 -me-2">
          <Link href="/songs" className="inline-flex items-center gap-2">
            <ArrowRight className="size-4" aria-hidden />
            חזרה לשירי הורים
          </Link>
        </Button>

        <article className="space-y-8">
          <header className="space-y-3">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl leading-tight text-right">
              {song.title}
            </h1>
            {song.artist_name ? (
              <p className="text-lg text-muted-foreground text-right">
                {song.artist_name}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center justify-end gap-3">
              <ShareButton
                title={song.title}
                text={shareText}
                url={shareUrl}
                previewImageUrl={sharePreviewImage}
                variant="outline"
                size="default"
                label="שיתוף"
                className="border-teal-600/30 bg-teal-50/50 text-foreground hover:bg-teal-100/80 hover:text-foreground dark:border-teal-800/50 dark:bg-teal-950/30 dark:hover:bg-teal-950/50"
              />
            </div>
          </header>

          <section aria-labelledby="song-video-heading" className="space-y-3">
            <h2 id="song-video-heading" className="sr-only">
              סרטון
            </h2>
            <YouTubePlayer url={song.youtube_url} title={song.title} className="w-full" />
          </section>

          <section
            className="rounded-xl border border-border/80 bg-muted/20 p-4 sm:p-6"
            aria-labelledby="lyrics-heading"
          >
            <h2
              id="lyrics-heading"
              className="text-lg font-semibold text-foreground mb-3 text-right"
            >
              מילות השיר
            </h2>
            <pre
              className="whitespace-pre-wrap font-sans text-foreground text-base leading-relaxed break-words text-right"
              dir="rtl"
            >
              {song.lyrics?.trim() || "אין מילים הוזנו לשיר זה."}
            </pre>
          </section>

          <section className="flex flex-col items-stretch sm:items-end pt-2">
            <Button variant="default" className="gap-2 w-full sm:w-auto bg-teal-600 hover:bg-teal-700" asChild>
              <Link href={contactHref(song)} className="inline-flex items-center justify-center gap-2">
                <MessageCircle className="size-4" aria-hidden />
                אני רוצה שיר כזה
              </Link>
            </Button>
          </section>
        </article>
      </div>
    </div>
  );
}
