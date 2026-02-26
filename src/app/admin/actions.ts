"use server";

import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!isAdmin(user.email)) redirect("/");
  return { user, supabase };
}

export interface AdminStats {
  pending_help_posts: number;
  open_contact_messages: number;
  open_reports: number;
  total_users: number;
  total_child_cards: number;
  read_child_cards: number;
  total_songs: number;
  total_articles: number;
}

/**
 * Fetches admin dashboard metrics. Must be called only after requireAdmin (e.g. from admin layout).
 * Uses service role to bypass RLS for counts.
 */
export async function getAdminStats(): Promise<AdminStats> {
  await requireAdmin();

  const db = adminClient;

  const [
    pendingHelpRes,
    openContactRes,
    openReportsRes,
    totalUsersRes,
    totalChildCardsRes,
    readChildCardsRes,
    totalSongsRes,
    totalArticlesRes,
  ] = await Promise.all([
    db.from("help_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    db.from("contact_submissions").select("id", { count: "exact", head: true }).eq("status", "open"),
    db
      .from("contact_submissions")
      .select("id", { count: "exact", head: true })
      .eq("status", "open")
      .in("category", ["report_abuse", "report_content"]),
    db.from("profiles").select("id", { count: "exact", head: true }),
    db.from("child_cards").select("id", { count: "exact", head: true }),
    db.from("child_cards").select("id", { count: "exact", head: true }).eq("is_read", true),
    db.from("songs").select("id", { count: "exact", head: true }),
    db.from("articles").select("id", { count: "exact", head: true }),
  ]);

  return {
    pending_help_posts: pendingHelpRes.count ?? 0,
    open_contact_messages: openContactRes.count ?? 0,
    open_reports: openReportsRes.count ?? 0,
    total_users: totalUsersRes.count ?? 0,
    total_child_cards: totalChildCardsRes.count ?? 0,
    read_child_cards: readChildCardsRes.count ?? 0,
    total_songs: totalSongsRes.count ?? 0,
    total_articles: totalArticlesRes.count ?? 0,
  };
}
