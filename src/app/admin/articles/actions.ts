"use server";

import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { uploadPublicFile } from "@/lib/supabase/public-storage";

export type ArticleMediaType = "video" | "image" | "link";

export interface AdminArticle {
  id: string;
  title: string;
  content: string | null;
  media_type: ArticleMediaType;
  media_url: string;
  link_thumbnail: string | null;
  is_published: boolean;
  created_at: string;
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

export async function getAllArticles(): Promise<AdminArticle[]> {
  const supabase = await getAdminSupabase();
  const { data, error } = await supabase
    .from("articles")
    .select("id, title, content, media_type, media_url, link_thumbnail, is_published, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAllArticles error:", error.message);
    return [];
  }
  return (data ?? []) as AdminArticle[];
}

export interface UpsertArticleInput {
  id?: string | null;
  title: string;
  content?: string | null;
  media_type: ArticleMediaType;
  media_url: string;
  link_thumbnail?: string | null;
  is_published: boolean;
}

export async function upsertArticle(
  input: UpsertArticleInput
): Promise<{ error?: string }> {
  const supabase = await getAdminSupabase();

  const row = {
    title: input.title.trim(),
    content: input.content?.trim() || null,
    media_type: input.media_type,
    media_url: input.media_url.trim(),
    link_thumbnail:
      input.media_type === "link"
        ? (input.link_thumbnail?.trim() || null)
        : null,
    is_published: !!input.is_published,
  };

  if (input.id && input.id.trim() !== "") {
    const { error } = await supabase
      .from("articles")
      .update(row)
      .eq("id", input.id);
    if (error) {
      console.error("upsertArticle update error:", error.message);
      return { error: error.message };
    }
  } else {
    const { error } = await supabase.from("articles").insert(row);
    if (error) {
      console.error("upsertArticle insert error:", error.message);
      return { error: error.message };
    }
  }

  revalidatePath("/admin/articles");
  revalidatePath("/articles");
  return {};
}

/**
 * Server action that accepts FormData: uploads image if provided, then upserts article.
 * FormData: id?, title, content, media_type, media_url, is_published,
 * media_file (image), link_thumbnail (text URL for link type), link_thumbnail_file (optional image for link preview).
 */
export async function upsertArticleWithFormData(
  formData: FormData
): Promise<{ error?: string }> {
  const id = (formData.get("id") as string)?.trim() || null;
  const title = (formData.get("title") as string)?.trim();
  const content = (formData.get("content") as string)?.trim() || null;
  const media_type = (formData.get("media_type") as string)?.trim() as
    | "video"
    | "image"
    | "link";
  let media_url = (formData.get("media_url") as string)?.trim() || "";
  const is_published = formData.get("is_published") === "true";
  const media_file = formData.get("media_file") as File | null;
  let link_thumbnail =
    (formData.get("link_thumbnail") as string)?.trim() || "";
  const link_thumbnail_file = formData.get("link_thumbnail_file") as File | null;

  if (!title) return { error: "כותרת חובה" };
  if (
    !media_type ||
    (media_type !== "video" &&
      media_type !== "image" &&
      media_type !== "link")
  ) {
    return { error: "נא לבחור סוג מדיה" };
  }

  if (media_type === "image" && media_file?.size) {
    const { url, error } = await uploadPublicFile(media_file, "articles");
    if (error) return { error };
    if (url) media_url = url;
  }

  if (media_type === "link" && link_thumbnail_file?.size) {
    const { url, error } = await uploadPublicFile(
      link_thumbnail_file,
      "articles"
    );
    if (error) return { error };
    if (url) link_thumbnail = url;
  }

  if (!media_url) {
    return {
      error:
        media_type === "video"
          ? "קישור יוטיוב חובה"
          : media_type === "link"
            ? "נא להזין כתובת URL חיצונית"
            : "נא להעלות תמונה או להזין כתובת תמונה",
    };
  }

  if (media_type === "link") {
    try {
      const u = new URL(media_url);
      if (u.protocol !== "http:" && u.protocol !== "https:") {
        return { error: "כתובת הקישור חייבת להתחיל ב-http או https" };
      }
    } catch {
      return { error: "כתובת הקישור אינה תקינה" };
    }
    if (link_thumbnail) {
      try {
        const t = new URL(link_thumbnail);
        if (t.protocol !== "http:" && t.protocol !== "https:") {
          return { error: "כתובת תמונת התצוגה חייבת להתחיל ב-http או https" };
        }
      } catch {
        return { error: "כתובת תמונת התצוגה אינה תקינה" };
      }
    }
  }

  return upsertArticle({
    id,
    title,
    content,
    media_type,
    media_url,
    link_thumbnail: media_type === "link" ? link_thumbnail || null : null,
    is_published,
  });
}

export async function deleteArticle(id: string): Promise<{ error?: string }> {
  const supabase = await getAdminSupabase();
  const { error } = await supabase.from("articles").delete().eq("id", id);
  if (error) {
    console.error("deleteArticle error:", error.message);
    return { error: error.message };
  }
  revalidatePath("/admin/articles");
  revalidatePath("/articles");
  return {};
}
