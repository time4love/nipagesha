import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getForumPostById } from "../../actions";
import { ForumPostForm } from "@/components/forum/ForumPostForm";

interface EditForumPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditForumPostPage({ params }: EditForumPostPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(`/forum/${id}/edit`)}`);
  }

  const post = await getForumPostById(id);
  if (!post) {
    notFound();
  }
  if (post.user_id !== user.id) {
    redirect("/forum");
  }

  return (
    <section className="space-y-8" dir="rtl">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">עריכת פוסט</h1>
        <p className="text-muted-foreground text-sm">
          עדכנו את הכותרת או התוכן. שינויים יישמרו בפוסט הקיים.
        </p>
      </header>
      <ForumPostForm
        mode="edit"
        postId={id}
        initialTitle={post.title}
        initialContent={post.content}
        initialFacebookLink={post.facebook_link ?? ""}
        backHref={`/forum/${id}`}
        backLabel="חזרה לפוסט"
      />
    </section>
  );
}
