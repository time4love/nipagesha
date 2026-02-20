/**
 * Public article data. Only published articles are returned.
 * For admin CRUD use admin/articles/actions.
 */

import { createClient } from "@/lib/supabase/server";

export type ArticleMediaType = "video" | "image";

export interface PublicArticle {
  id: string;
  title: string;
  content: string | null;
  media_type: ArticleMediaType;
  media_url: string;
  created_at: string;
}

export interface GetPublishedArticlesResult {
  data: PublicArticle[];
  hasMore: boolean;
}

export async function getPublishedArticles(
  offset: number = 0,
  limit: number = 10
): Promise<GetPublishedArticlesResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("id, title, content, media_type, media_url, created_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("getPublishedArticles error:", error.message);
    return { data: [], hasMore: false };
  }
  const list = (data ?? []) as PublicArticle[];
  return { data: list, hasMore: list.length === limit };
}

export async function getPublishedArticleById(
  id: string
): Promise<PublicArticle | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("id, title, content, media_type, media_url, created_at")
    .eq("id", id)
    .eq("is_published", true)
    .single();

  if (error || !data) return null;
  return data as PublicArticle;
}
