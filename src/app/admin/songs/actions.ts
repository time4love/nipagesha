"use server";

import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export interface AdminSong {
  id: string;
  title: string;
  lyrics: string | null;
  youtube_url: string;
  artist_name: string | null;
  created_at: string;
  is_published: boolean;
}

async function getAdminSupabase() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!isAdmin(user.email)) redirect("/");
  return supabase;
}

export async function getAllSongs(): Promise<AdminSong[]> {
  const supabase = await getAdminSupabase();
  const { data, error } = await supabase
    .from("songs")
    .select("id, title, lyrics, youtube_url, artist_name, created_at, is_published")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAllSongs error:", error.message);
    return [];
  }
  return (data ?? []) as AdminSong[];
}

export interface UpsertSongInput {
  id?: string | null;
  title: string;
  artist_name?: string | null;
  youtube_url: string;
  lyrics?: string | null;
  is_published: boolean;
}

export async function upsertSong(input: UpsertSongInput): Promise<{ error?: string }> {
  const supabase = await getAdminSupabase();

  const row = {
    title: input.title.trim(),
    artist_name: input.artist_name?.trim() || null,
    youtube_url: input.youtube_url.trim(),
    lyrics: input.lyrics?.trim() || null,
    is_published: !!input.is_published,
  };

  if (input.id && input.id.trim() !== "") {
    const { error } = await supabase.from("songs").update(row).eq("id", input.id);
    if (error) {
      console.error("upsertSong update error:", error.message);
      return { error: error.message };
    }
  } else {
    const { error } = await supabase.from("songs").insert(row);
    if (error) {
      console.error("upsertSong insert error:", error.message);
      return { error: error.message };
    }
  }

  revalidatePath("/admin/songs");
  revalidatePath("/songs");
  return {};
}

export async function deleteSong(id: string): Promise<{ error?: string }> {
  const supabase = await getAdminSupabase();
  const { error } = await supabase.from("songs").delete().eq("id", id);
  if (error) {
    console.error("deleteSong error:", error.message);
    return { error: error.message };
  }
  revalidatePath("/admin/songs");
  revalidatePath("/songs");
  return {};
}
