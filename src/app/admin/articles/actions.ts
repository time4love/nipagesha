"use server";

import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { uploadPublicFile } from "@/lib/supabase/public-storage";

export type ArticleMediaType = "video" | "image";

export interface AdminArticle {
  id: string;
  title: string;
  content: string | null;
  media_type: ArticleMediaType;
  media_url: string;
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
    .select("id, title, content, media_type, media_url, is_published, created_at")
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
 * FormData fields: id (optional), title, content, media_type, media_url, is_published, media_file (optional File).
 */
export async function upsertArticleWithFormData(
  formData: FormData
): Promise<{ error?: string }> {
  const id = (formData.get("id") as string)?.trim() || null;
  const title = (formData.get("title") as string)?.trim();
  const content = (formData.get("content") as string)?.trim() || null;
  const media_type = (formData.get("media_type") as string)?.trim() as
    | "video"
    | "image";
  let media_url = (formData.get("media_url") as string)?.trim() || "";
  const is_published = formData.get("is_published") === "true";
  const media_file = formData.get("media_file") as File | null;

  if (!title) return { error: "כותרת חובה" };
  if (!media_type || (media_type !== "video" && media_type !== "image")) {
    return { error: "נא לבחור סוג מדיה: וידאו או תמונה" };
  }

  if (media_type === "image" && media_file?.size) {
    const { url, error } = await uploadPublicFile(media_file, "articles");
    if (error) return { error };
    if (url) media_url = url;
  }

  if (!media_url) {
    return {
      error:
        media_type === "video"
          ? "קישור יוטיוב חובה"
          : "נא להעלות תמונה או להזין כתובת תמונה",
    };
  }

  return upsertArticle({
    id,
    title,
    content,
    media_type,
    media_url,
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
