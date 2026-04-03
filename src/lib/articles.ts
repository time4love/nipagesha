/**
 * Public article data. Only published articles are returned.
 * For admin CRUD use admin/articles/actions.
 */

import { createClient } from "@/lib/supabase/server";
import { resolveForumOgImageUrl } from "@/lib/forum";

/** Extract YouTube video ID from common watch/embed/shorts URLs. */
export function extractYoutubeVideoIdFromUrl(url: string): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;
  try {
    const u = new URL(trimmed);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id || null;
    }
    if (host === "youtube.com" || host === "m.youtube.com" || host === "www.youtube.com") {
      if (u.pathname.startsWith("/embed/")) {
        const id = u.pathname.slice("/embed/".length).split("/")[0];
        return id || null;
      }
      const shorts = u.pathname.match(/^\/shorts\/([^/?]+)/);
      if (shorts?.[1]) return shorts[1];
      const v = u.searchParams.get("v");
      if (v) return v;
    }
  } catch {
    return null;
  }
  return null;
}

/** Absolute Open Graph image URL for a published article. */
export function getArticleOpenGraphImageUrl(
  article: PublicArticle,
  siteOrigin: string
): string {
  const origin = siteOrigin.replace(/\/$/, "");
  const fallback = `${origin}/opengraph-image.png`;

  if (article.media_type === "image" && article.media_url?.trim()) {
    return resolveForumOgImageUrl(article.media_url, siteOrigin);
  }

  if (article.media_type === "video" && article.media_url?.trim()) {
    const id = extractYoutubeVideoIdFromUrl(article.media_url);
    if (id) {
      return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
    }
    return fallback;
  }

  if (article.media_type === "link" && article.link_thumbnail?.trim()) {
    return resolveForumOgImageUrl(article.link_thumbnail, siteOrigin);
  }

  return fallback;
}

export type ArticleMediaType = "video" | "image" | "link";

export interface PublicArticle {
  id: string;
  title: string;
  content: string | null;
  media_type: ArticleMediaType;
  /** Primary media: YouTube URL, image URL, or external page URL for `link`. */
  media_url: string;
  /** Optional preview image URL when `media_type` is `link`. */
  link_thumbnail: string | null;
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
    .select("id, title, content, media_type, media_url, link_thumbnail, created_at")
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
    .select("id, title, content, media_type, media_url, link_thumbnail, created_at")
    .eq("id", id)
    .eq("is_published", true)
    .single();

  if (error || !data) return null;
  return data as PublicArticle;
}
