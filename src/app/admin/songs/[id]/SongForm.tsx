"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { YouTubePlayer } from "@/components/songs/YouTubePlayer";
import { upsertSong } from "../actions";
import type { AdminSong } from "../actions";
import { ArrowRight } from "lucide-react";

interface SongFormProps {
  initialSong: AdminSong | null;
  isNew: boolean;
}

export function SongForm({ initialSong, isNew }: SongFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialSong?.title ?? "");
  const [artistName, setArtistName] = useState(initialSong?.artist_name ?? "");
  const [youtubeUrl, setYoutubeUrl] = useState(initialSong?.youtube_url ?? "");
  const [lyrics, setLyrics] = useState(initialSong?.lyrics ?? "");
  const [isPublished, setIsPublished] = useState(initialSong?.is_published ?? true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await upsertSong({
        id: isNew ? null : initialSong!.id,
        title,
        artist_name: artistName || null,
        youtube_url: youtubeUrl,
        lyrics: lyrics || null,
        is_published: isPublished,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/admin/songs");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">כותרת *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="שם השיר"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="artist">אמן</Label>
            <Input
              id="artist"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              placeholder="שם האמן"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="youtube_url">קישור יוטיוב *</Label>
            <Input
              id="youtube_url"
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              required
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lyrics">מילות השיר</Label>
            <textarea
              id="lyrics"
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              rows={8}
              className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
              placeholder="מילות השיר (שורות חדשות יישמרו)"
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="is_published"
              checked={isPublished}
              onCheckedChange={setIsPublished}
            />
            <Label htmlFor="is_published" className="cursor-pointer">
              פורסם (מופיע בדף השירים)
            </Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label>תצוגה מקדימה</Label>
          <YouTubePlayer
            url={youtubeUrl}
            title={title || "תצוגה מקדימה"}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "שומר..." : isNew ? "הוסף שיר" : "עדכן שיר"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/songs" className="inline-flex items-center gap-2">
            <ArrowRight className="size-4" aria-hidden />
            חזרה לרשימה
          </Link>
        </Button>
      </div>
    </form>
  );
}
