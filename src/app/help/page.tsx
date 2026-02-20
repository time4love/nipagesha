import { createClient } from "@/lib/supabase/server";
import { getHelpRequests, getCategories } from "./actions";
import { HelpBoardClient } from "./HelpBoardClient";

interface HelpPageProps {
  searchParams: Promise<{ category?: string; location?: string }>;
}

export default async function HelpPage({ searchParams }: HelpPageProps) {
  const params = await searchParams;
  const category = params.category ?? undefined;
  const location = params.location ?? undefined;

  const [helpResult, categories] = await Promise.all([
    getHelpRequests({ category, location }, 0, 10),
    getCategories(),
  ]);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let defaultName = "";
  let defaultContact = "";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();
    defaultName = profile?.display_name?.trim() ?? "";
    defaultContact = user.email ?? "";
  }

  return (
    <section className="space-y-8" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">לוח עזרה</h1>
        <p className="mt-1 text-muted-foreground">
          הורים עוזרים להורים. בחרו בקשה וצרו קשר אם אתם יכולים לעזור.
        </p>
      </div>
      <HelpBoardClient
        key={`${category ?? ""}-${location ?? ""}`}
        initialRequests={helpResult.data}
        initialHasMore={helpResult.hasMore}
        filterCategory={category}
        filterLocation={location}
        categories={categories}
        defaultName={defaultName}
        defaultContact={defaultContact}
        currentUserId={user?.id ?? null}
      />
    </section>
  );
}
