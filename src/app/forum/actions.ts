"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ForumCommentRow, ForumPostRow, HelpRequestRow } from "@/lib/supabase/types";
import { FORUM_CATEGORIES } from "@/lib/constants";
import { extractFirstImageUrlFromHtml } from "@/lib/forum";
import { getRequesterDisplay } from "@/lib/help";
import { sendEmail } from "@/lib/email";
import { getAdminEmails } from "@/lib/admin";

const FORUM_PUBLIC_BASE = "https://www.nipagesha.co.il/forum";

function escapeHtmlForEmail(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function htmlToPlainSnippet(html: string, maxLen: number): string {
  const stripped = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (stripped.length <= maxLen) return stripped;
  return `${stripped.slice(0, maxLen)}…`;
}

function rtlEmailWrap(innerHtml: string): string {
  return `<div dir="rtl" style="font-family: sans-serif;">${innerHtml}</div>`;
}

const DEFAULT_PAGE_SIZE = 10;

type ProfileFields = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  is_anonymous: boolean;
  privacy_level: string;
};

export interface ForumPostListItem {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
  author_display_name: string;
  author_avatar_url: string | null;
  comment_count: number;
  like_count: number;
  liked_by_me: boolean;
}

export interface ForumCommentWithAuthor extends ForumCommentRow {
  author_display_name: string;
  author_avatar_url: string | null;
}

export interface CreateForumPostInput {
  title: string;
  category: string;
  content: string;
}

/** Same shape as create; used for updates. */
export type UpdateForumPostInput = CreateForumPostInput;

export interface GetForumPostsResult {
  data: ForumPostListItem[];
  hasMore: boolean;
}

function isForumCategory(value: string): value is (typeof FORUM_CATEGORIES)[number] {
  return (FORUM_CATEGORIES as readonly string[]).includes(value);
}

function resolveAuthor(
  profile: ProfileFields | null | undefined,
  viewerIsAuthenticated: boolean
): { displayName: string; avatarUrl: string | null } {
  const { displayName, avatarUrl } = getRequesterDisplay(
    { is_anonymous: false } as HelpRequestRow,
    profile ?? null,
    viewerIsAuthenticated
  );
  return { displayName, avatarUrl };
}

function mapRowsToListItems(
  posts: ForumPostRow[],
  user: { id: string } | null,
  profileMap: Map<string, ProfileFields>,
  countMap: Map<string, number>
): ForumPostListItem[] {
  const viewerAuth = !!user;
  return posts.map((post) => {
    const profile = profileMap.get(post.user_id);
    const { displayName, avatarUrl } = resolveAuthor(profile, viewerAuth);
    const thumbnail =
      post.thumbnail_url ??
      extractFirstImageUrlFromHtml(post.content) ??
      null;
    return {
      id: post.id,
      user_id: post.user_id,
      title: post.title,
      content: post.content,
      category: post.category,
      thumbnail_url: thumbnail,
      created_at: post.created_at,
      updated_at: post.updated_at,
      author_display_name: displayName,
      author_avatar_url: avatarUrl,
      comment_count: countMap.get(post.id) ?? 0,
      like_count: 0,
      liked_by_me: false,
    };
  });
}

export async function getForumPosts(
  category?: string | null,
  offset: number = 0,
  limit: number = DEFAULT_PAGE_SIZE
): Promise<GetForumPostsResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("forum_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (category && isForumCategory(category)) {
    query = query.eq("category", category);
  }

  const { data: rows, error } = await query;
  if (error) {
    return { data: [], hasMore: false };
  }
  if (!rows?.length) {
    return { data: [], hasMore: false };
  }

  const posts = rows as ForumPostRow[];
  const userIds = [...new Set(posts.map((p) => p.user_id))];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, is_anonymous, privacy_level")
    .in("id", userIds);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p as ProfileFields]));

  const postIds = posts.map((p) => p.id);
  const { data: commentRows } = await supabase
    .from("forum_comments")
    .select("post_id")
    .in("post_id", postIds);

  const countMap = new Map<string, number>();
  for (const row of commentRows ?? []) {
    const pid = row.post_id as string;
    countMap.set(pid, (countMap.get(pid) ?? 0) + 1);
  }

  const hasMore = posts.length === limit;

  return {
    data: mapRowsToListItems(posts, user, profileMap, countMap),
    hasMore,
  };
}

export async function getForumPostById(id: string): Promise<ForumPostListItem | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: post, error } = await supabase
    .from("forum_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !post) return null;

  const row = post as ForumPostRow;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, is_anonymous, privacy_level")
    .eq("id", row.user_id)
    .maybeSingle();

  const { count: commentCountRaw } = await supabase
    .from("forum_comments")
    .select("*", { count: "exact", head: true })
    .eq("post_id", id);

  const commentCount = commentCountRaw ?? 0;

  const { count: likeCountRaw } = await supabase
    .from("forum_post_likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", id);

  const likeCount = likeCountRaw ?? 0;

  let likedByMe = false;
  if (user) {
    const { data: likeRow } = await supabase
      .from("forum_post_likes")
      .select("id")
      .eq("post_id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    likedByMe = Boolean(likeRow);
  }

  const { displayName, avatarUrl } = resolveAuthor(profile as ProfileFields | null, !!user);

  const profileMap = new Map<string, ProfileFields>();
  if (profile) {
    profileMap.set(row.user_id, profile as ProfileFields);
  }
  const countMap = new Map([[row.id, commentCount]]);
  const [mapped] = mapRowsToListItems([row], user, profileMap, countMap);
  if (!mapped) return null;
  return { ...mapped, like_count: likeCount, liked_by_me: likedByMe };
}

export type TogglePostLikeResult =
  | { ok: true; liked: boolean; likeCount: number }
  | { ok: false; error: string };

export async function togglePostLike(postId: string): Promise<TogglePostLikeResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "יש להתחבר כדי לסמן לייק." };
  }

  const { data: existing } = await supabase
    .from("forum_post_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error: delErr } = await supabase
      .from("forum_post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);
    if (delErr) {
      return { ok: false, error: delErr.message };
    }
  } else {
    const { error: insErr } = await supabase.from("forum_post_likes").insert({
      post_id: postId,
      user_id: user.id,
    });
    if (insErr) {
      return { ok: false, error: insErr.message };
    }
  }

  const { count: nextCount } = await supabase
    .from("forum_post_likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId);

  const likeCount = nextCount ?? 0;
  const liked = !existing;

  revalidatePath("/forum");
  revalidatePath(`/forum/${postId}`);
  revalidatePath("/dashboard");

  return { ok: true, liked, likeCount };
}

/** Current user's forum posts (dashboard); newest first, with comment counts. */
export async function getUserForumPosts(): Promise<ForumPostListItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  const { data: rows, error } = await supabase
    .from("forum_posts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !rows?.length) {
    return [];
  }

  const posts = rows as ForumPostRow[];
  const postIds = posts.map((p) => p.id);
  const { data: commentRows } = await supabase
    .from("forum_comments")
    .select("post_id")
    .in("post_id", postIds);

  const countMap = new Map<string, number>();
  for (const row of commentRows ?? []) {
    const pid = row.post_id as string;
    countMap.set(pid, (countMap.get(pid) ?? 0) + 1);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, is_anonymous, privacy_level")
    .eq("id", user.id)
    .maybeSingle();

  const profileMap = new Map<string, ProfileFields>();
  if (profile) {
    profileMap.set(user.id, profile as ProfileFields);
  }

  return mapRowsToListItems(posts, user, profileMap, countMap);
}

export async function getPostComments(postId: string): Promise<ForumCommentWithAuthor[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rows, error } = await supabase
    .from("forum_comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error || !rows?.length) {
    return [];
  }

  const comments = rows as ForumCommentRow[];
  const userIds = [...new Set(comments.map((c) => c.user_id))];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, is_anonymous, privacy_level")
    .in("id", userIds);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p as ProfileFields]));

  return comments.map((c) => {
    const profile = profileMap.get(c.user_id);
    const { displayName, avatarUrl } = resolveAuthor(profile, !!user);
    return {
      ...c,
      author_display_name: displayName,
      author_avatar_url: avatarUrl,
    };
  });
}

export async function createForumPost(
  data: CreateForumPostInput
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "יש להתחבר כדי לפרסם פוסט." };
  }

  const title = data.title?.trim() ?? "";
  const content = data.content?.trim() ?? "";
  const category = data.category?.trim() ?? "";

  if (!title || !content) {
    return { success: false, error: "נא למלא כותרת ותוכן." };
  }
  if (!isForumCategory(category)) {
    return { success: false, error: "נא לבחור קטגוריה מהרשימה." };
  }

  const thumbnailUrl = extractFirstImageUrlFromHtml(content);

  const { data: inserted, error } = await supabase
    .from("forum_posts")
    .insert({
      user_id: user.id,
      title,
      content,
      category,
      thumbnail_url: thumbnailUrl,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  const postId = inserted?.id as string | undefined;
  if (postId) {
    try {
      const admins = getAdminEmails();
      if (admins.length > 0) {
        const { data: authorProfile } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url, is_anonymous, privacy_level")
          .eq("id", user.id)
          .maybeSingle();
        const { displayName: authorName } = resolveAuthor(
          authorProfile as ProfileFields | null,
          true
        );
        const snippet = htmlToPlainSnippet(content, 220);
        const postUrl = `${FORUM_PUBLIC_BASE}/${postId}`;
        const subject = `[ניפגשה] פוסט חדש בקהילה: ${title}`;
        const html = rtlEmailWrap(`
    <p style="margin:0 0 14px; line-height:1.5;">פוסט חדש פורסם בקהילה.</p>
    <p style="margin:0 0 8px; line-height:1.5;"><strong>מחבר/ת:</strong> ${escapeHtmlForEmail(authorName)}</p>
    <p style="margin:0 0 8px; line-height:1.5;"><strong>כותרת:</strong> ${escapeHtmlForEmail(title)}</p>
    <p style="margin:0 0 14px; line-height:1.5;"><strong>תצוגה מקדימה:</strong> ${escapeHtmlForEmail(snippet)}</p>
    <p style="margin:0;"><a href="${escapeHtmlForEmail(postUrl)}" style="color:#2563eb;">צפייה בפוסט</a></p>
  `);
        await sendEmail({ to: admins, subject, html });
      }
    } catch {
      if (process.env.NODE_ENV === "development") {
        console.warn("[forum] Admin notification email failed after new post.");
      }
    }
  }

  revalidatePath("/forum");
  revalidatePath("/dashboard");
  redirect("/forum");
}

export async function createForumComment(
  postId: string,
  content: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "יש להתחבר כדי להגיב." };
  }

  const text = content?.trim() ?? "";
  if (!text) {
    return { success: false, error: "נא לכתוב תוכן להערה." };
  }

  const { error } = await supabase.from("forum_comments").insert({
    post_id: postId,
    user_id: user.id,
    content: text,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  try {
    const admins = getAdminEmails();
    if (admins.length > 0) {
      const { data: postRow } = await supabase
        .from("forum_posts")
        .select("title, user_id")
        .eq("id", postId)
        .maybeSingle();

      // TODO: In the future, send an email to the post author (post.user_id) if they opt-in to notifications.

      const postTitle =
        (postRow as { title: string } | null)?.title?.trim() || "פוסט ללא כותרת";

      const { data: commenterProfile } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, is_anonymous, privacy_level")
        .eq("id", user.id)
        .maybeSingle();
      const { displayName: commenterName } = resolveAuthor(
        commenterProfile as ProfileFields | null,
        true
      );

      const postUrl = `${FORUM_PUBLIC_BASE}/${postId}`;
      const subject = "[ניפגשה] תגובה חדשה בקהילה";
      const html = rtlEmailWrap(`
    <p style="margin:0 0 12px; line-height:1.5;">תגובה חדשה פורסמה בקהילה.</p>
    <p style="margin:0 0 8px; line-height:1.5;"><strong>פוסט:</strong> ${escapeHtmlForEmail(postTitle)}</p>
    <p style="margin:0 0 8px; line-height:1.5;"><strong>מגיב/ה:</strong> ${escapeHtmlForEmail(commenterName)}</p>
    <p style="margin:0 0 6px; line-height:1.5;"><strong>תוכן התגובה:</strong></p>
    <p style="margin:0 0 14px; line-height:1.6; white-space:pre-wrap;">${escapeHtmlForEmail(text)}</p>
    <p style="margin:0;"><a href="${escapeHtmlForEmail(postUrl)}" style="color:#2563eb;">צפייה בפוסט</a></p>
  `);
      await sendEmail({ to: admins, subject, html });
    }
  } catch {
    if (process.env.NODE_ENV === "development") {
      console.warn("[forum] Admin notification email failed after new comment.");
    }
  }

  revalidatePath("/forum");
  revalidatePath(`/forum/${postId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateForumPost(
  postId: string,
  data: UpdateForumPostInput
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "יש להתחבר כדי לערוך פוסט." };
  }

  const title = data.title?.trim() ?? "";
  const content = data.content?.trim() ?? "";
  const category = data.category?.trim() ?? "";

  if (!title || !content) {
    return { success: false, error: "נא למלא כותרת ותוכן." };
  }
  if (!isForumCategory(category)) {
    return { success: false, error: "נא לבחור קטגוריה מהרשימה." };
  }

  const thumbnailUrl = extractFirstImageUrlFromHtml(content);

  const { data: updated, error } = await supabase
    .from("forum_posts")
    .update({
      title,
      content,
      category,
      thumbnail_url: thumbnailUrl,
    })
    .eq("id", postId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return { success: false, error: error.message };
  }
  if (!updated) {
    return { success: false, error: "לא נמצא פוסט או שאין הרשאה לעריכה." };
  }

  revalidatePath("/forum");
  revalidatePath(`/forum/${postId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteForumPost(
  postId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "יש להתחבר כדי למחוק פוסט." };
  }

  const { data: deletedRows, error } = await supabase
    .from("forum_posts")
    .delete()
    .eq("id", postId)
    .eq("user_id", user.id)
    .select("id");

  if (error) {
    return { success: false, error: error.message };
  }
  if (!deletedRows?.length) {
    return { success: false, error: "לא נמצא פוסט או שאין הרשאה למחיקה." };
  }

  revalidatePath("/forum");
  revalidatePath("/dashboard");
  return { success: true };
}
