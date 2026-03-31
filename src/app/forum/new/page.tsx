import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ForumNewPostForm } from "./ForumNewPostForm";

export default async function NewForumPostPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?redirect=/forum/new");
  }

  return (
    <section className="space-y-8" dir="rtl">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">פוסט חדש</h1>
        <p className="text-muted-foreground text-sm">
          התוכן יוצג לקהילה. שמרו על שפה מכבדת ובטוחה.
        </p>
      </header>
      <ForumNewPostForm />
    </section>
  );
}
