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

export async function getSongs(): Promise<Song[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("songs")
    .select("id, title, lyrics, youtube_url, artist_name, created_at, is_published")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getSongs error:", error.message);
    return [];
  }
  return (data ?? []) as Song[];
}
