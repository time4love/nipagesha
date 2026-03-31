import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { PenLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { FORUM_CATEGORIES } from "@/lib/constants";
import { getForumPosts } from "./actions";
import { ForumFeedClient } from "@/components/forum/ForumFeedClient";

interface ForumPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ForumPage({ searchParams }: ForumPageProps) {
  const params = await searchParams;
  const categoryParam = params.category?.trim();
  const activeCategory =
    categoryParam &&
    (FORUM_CATEGORIES as readonly string[]).includes(categoryParam)
      ? categoryParam
      : undefined;

  const supabase = await createClient();
  const [{ data: initialPosts, hasMore: initialHasMore }, userResult] = await Promise.all([
    getForumPosts(activeCategory ?? null, 0, 10),
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
              קהילת ניפגשה — המרחב הבטוח שלכם
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
              שתפו חוויות, קבלו תמיכה והתחברו להורים כמוכם.
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

        <nav aria-label="סינון לפי קטגוריה" className="flex flex-wrap gap-2">
          <CategoryLink href="/forum" active={!activeCategory}>
            הכל
          </CategoryLink>
          {FORUM_CATEGORIES.map((cat) => (
            <CategoryLink
              key={cat}
              href={`/forum?category=${encodeURIComponent(cat)}`}
              active={activeCategory === cat}
            >
              {cat}
            </CategoryLink>
          ))}
        </nav>
      </header>

      {initialPosts.length === 0 ? (
        <p className="text-center text-muted-foreground py-16 rounded-lg border border-dashed">
          {activeCategory
            ? "אין פוסטים בקטגוריה זו עדיין."
            : "אין פוסטים עדיין — היו הראשונים לשתף."}
        </p>
      ) : (
        <ForumFeedClient
          key={activeCategory ?? "all"}
          initialPosts={initialPosts}
          initialHasMore={initialHasMore}
          category={activeCategory ?? null}
          currentUserId={user?.id ?? null}
        />
      )}
    </section>
  );
}

function CategoryLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1.5 text-sm transition-colors",
        active
          ? "border-teal-600 bg-teal-50 text-teal-900 dark:bg-teal-950/50 dark:text-teal-100"
          : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
