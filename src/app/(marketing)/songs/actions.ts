"use server";

import { createClient } from "@/lib/supabase/server";

export interface Song {
  id: string;
  title: string;
  lyrics: string | null;
  youtube_url: string;
  artist_name: string | null;
  created_at: string;
  is_published: boolean;
}

export interface GetSongsResult {
  data: Song[];
  hasMore: boolean;
}

export async function getSongs(
  offset: number = 0,
  limit: number = 10
): Promise<GetSongsResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("songs")
    .select("id, title, lyrics, youtube_url, artist_name, created_at, is_published")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("getSongs error:", error.message);
    return { data: [], hasMore: false };
  }
  const list = (data ?? []) as Song[];
  return { data: list, hasMore: list.length === limit };
}
