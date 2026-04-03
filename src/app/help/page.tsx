import { createClient } from "@/lib/supabase/server";
import { getHelpRequests, getHelpOffers } from "./actions";
import { HelpBoardClient } from "./HelpBoardClient";

interface HelpPageProps {
  searchParams: Promise<{ location?: string; action?: string }>;
}

export default async function HelpPage({ searchParams }: HelpPageProps) {
  const params = await searchParams;
  const location = params.location ?? undefined;
  const openOfferForm = params.action === "offer";

  const [helpResult, offersResult] = await Promise.all([
    getHelpRequests({ location }, 0, 10),
    getHelpOffers({ location }, 0, 10),
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
      <HelpBoardClient
        key={`${location ?? ""}-${openOfferForm}`}
        title="לוח עזרה"
        subtitle="בקשות והצעות עזרה"
        initialRequests={helpResult.data}
        initialHasMore={helpResult.hasMore}
        initialOffers={offersResult.data}
        initialOffersHasMore={offersResult.hasMore}
        filterLocation={location}
        defaultName={defaultName}
        defaultContact={defaultContact}
        defaultIsAnonymous={defaultIsAnonymous}
        currentUserId={user?.id ?? null}
        initialOpenCreateOffer={openOfferForm}
      />
    </section>
  );
}
