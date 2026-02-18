import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { ArticleForm } from "./ArticleForm";
import type { AdminArticle } from "../actions";

export const metadata = {
  title: "עריכת מאמר | ניפגשה",
  description: "עריכת או הוספת מאמר",
};

export default async function AdminArticleEditPage({
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
  let initialArticle: AdminArticle | null = null;

  if (!isNew) {
    const { data } = await supabase
      .from("articles")
      .select("id, title, content, media_type, media_url, is_published, created_at")
      .eq("id", id)
      .single();
    if (data) initialArticle = data as AdminArticle;
    else notFound();
  }

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-2xl font-bold text-foreground">
        {isNew ? "מאמר חדש" : "עריכת מאמר"}
      </h1>
      <ArticleForm initialArticle={initialArticle} isNew={isNew} />
    </div>
  );
}
