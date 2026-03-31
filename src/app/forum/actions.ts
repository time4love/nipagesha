"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ForumCommentRow, ForumPostRow, HelpRequestRow } from "@/lib/supabase/types";
import { FORUM_CATEGORIES } from "@/lib/constants";
import { getRequesterDisplay } from "@/lib/help";

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

function extractFirstImageUrlFromHtml(html: string): string | null {
  const doubleQuote = html.match(/<img[^>]+src="([^">]+)"/i);
  if (doubleQuote?.[1]?.trim()) return doubleQuote[1].trim();
  const singleQuote = html.match(/<img[^>]+src='([^'>]+)'/i);
  if (singleQuote?.[1]?.trim()) return singleQuote[1].trim();
  return null;
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

  const { displayName, avatarUrl } = resolveAuthor(profile as ProfileFields | null, !!user);

  const profileMap = new Map<string, ProfileFields>();
  if (profile) {
    profileMap.set(row.user_id, profile as ProfileFields);
  }
  const countMap = new Map([[row.id, commentCount]]);
  const [mapped] = mapRowsToListItems([row], user, profileMap, countMap);
  return mapped ?? null;
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

  const { error } = await supabase.from("forum_posts").insert({
    user_id: user.id,
    title,
    content,
    category,
    thumbnail_url: thumbnailUrl,
  });

  if (error) {
    return { success: false, error: error.message };
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
