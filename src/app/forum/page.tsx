import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { PenLine } from "lucide-react";
import { getForumPosts } from "./actions";
import { ForumFeedClient } from "@/components/forum/ForumFeedClient";

export default async function ForumPage() {
  const supabase = await createClient();
  const [{ data: initialPosts, hasMore: initialHasMore }, userResult] = await Promise.all([
    getForumPosts(null, 0, 10),
    supabase.auth.getUser(),
  ]);
  const user = userResult.data.user;

  const createHref = user ? "/forum/new" : "/login?redirect=/forum/new";

  return (
    <section className="space-y-8" dir="rtl">
      <header className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              קהילת ניפגשה
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
              זה המקום לשאול שאלות, לקבל מידע ולשתף
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="shrink-0 bg-teal-600 hover:bg-teal-700 text-white w-full sm:w-auto"
          >
            <Link href={createHref}>
              <PenLine className="size-4 ml-2" aria-hidden />
              כתוב פוסט חדש
            </Link>
          </Button>
        </div>
      </header>

      {initialPosts.length === 0 ? (
        <p className="text-center text-muted-foreground py-16 rounded-lg border border-dashed">
          אין פוסטים עדיין — היו הראשונים לשתף.
        </p>
      ) : (
        <ForumFeedClient
          initialPosts={initialPosts}
          initialHasMore={initialHasMore}
          currentUserId={user?.id ?? null}
        />
      )}
    </section>
  );
}
