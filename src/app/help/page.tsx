import { createClient } from "@/lib/supabase/server";
import { getHelpRequests, getHelpOffers, getCategories } from "./actions";
import { HelpBoardClient } from "./HelpBoardClient";

interface HelpPageProps {
  searchParams: Promise<{ category?: string; location?: string }>;
}

export default async function HelpPage({ searchParams }: HelpPageProps) {
  const params = await searchParams;
  const category = params.category ?? undefined;
  const location = params.location ?? undefined;

  const [helpResult, offersResult, categories] = await Promise.all([
    getHelpRequests({ category, location }, 0, 10),
    getHelpOffers({ category, location }, 0, 10),
    getCategories(),
  ]);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let defaultName = "";
  let defaultContact = "";
  let defaultIsAnonymous = true;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, is_anonymous")
      .eq("id", user.id)
      .single();
    defaultName = profile?.display_name?.trim() ?? "";
    defaultContact = user.email ?? "";
    defaultIsAnonymous = profile?.is_anonymous !== false;
  }

  return (
    <section className="space-y-8" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">לוח עזרה</h1>
        <p className="mt-1 text-muted-foreground">
          הורים עוזרים להורים. בחרו בקשה או הצעת עזרה וצרו קשר.
        </p>
      </div>
      <HelpBoardClient
        key={`${category ?? ""}-${location ?? ""}`}
        initialRequests={helpResult.data}
        initialHasMore={helpResult.hasMore}
        initialOffers={offersResult.data}
        initialOffersHasMore={offersResult.hasMore}
        filterCategory={category}
        filterLocation={location}
        categories={categories}
        defaultName={defaultName}
        defaultContact={defaultContact}
        defaultIsAnonymous={defaultIsAnonymous}
        currentUserId={user?.id ?? null}
      />
    </section>
  );
}
