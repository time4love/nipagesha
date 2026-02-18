import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { SongForm } from "./SongForm";
import type { AdminSong } from "../actions";

export const metadata = {
  title: "עריכת שיר | ניפגשה",
  description: "עריכת או הוספת שיר",
};

export default async function AdminSongEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();
  if (!isAdmin(user.email)) notFound();

  const isNew = id === "new";
  let initialSong: AdminSong | null = null;

  if (!isNew) {
    const { data } = await supabase
      .from("songs")
      .select("id, title, lyrics, youtube_url, artist_name, created_at, is_published")
      .eq("id", id)
      .single();
    if (data) initialSong = data as AdminSong;
    else notFound();
  }

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-2xl font-bold text-foreground">
        {isNew ? "שיר חדש" : "עריכת שיר"}
      </h1>
      <SongForm initialSong={initialSong} isNew={isNew} />
    </div>
  );
}
