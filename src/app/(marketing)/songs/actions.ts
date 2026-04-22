"use server";

import { createClient } from "@/lib/supabase/server";

/** List/grid: no lyrics payload (smaller RSC + faster scroll). */
export interface SongListItem {
  id: string;
  title: string;
  youtube_url: string;
  artist_name: string | null;
  created_at: string;
}

export interface Song extends SongListItem {
  lyrics: string | null;
  is_published: boolean;
}

export interface GetSongsResult {
  data: SongListItem[];
  hasMore: boolean;
}

export async function getSongs(
  offset: number = 0,
  limit: number = 10
): Promise<GetSongsResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("songs")
    .select("id, title, youtube_url, artist_name, created_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("getSongs error:", error.message);
    return { data: [], hasMore: false };
  }
  const list = (data ?? []) as SongListItem[];
  return { data: list, hasMore: list.length === limit };
}

export async function getPublishedSongById(id: string): Promise<Song | null> {
  const trimmed = id?.trim();
  if (!trimmed) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("songs")
    .select("id, title, lyrics, youtube_url, artist_name, created_at, is_published")
    .eq("id", trimmed)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("getPublishedSongById error:", error.message);
    return null;
  }
  return data as Song;
}
