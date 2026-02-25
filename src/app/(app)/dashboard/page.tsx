import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type {
  ChildCardRow,
  CardAccessLogRow,
  ChildReplyRow,
} from "@/lib/supabase/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid } from "lucide-react";
import { DashboardCard } from "./DashboardCard";
import { getMyHelpRequests, getMyHelpOffers, getUnreadHelpOffersByRequest } from "./help/actions";
import { getCategories } from "@/app/help/actions";
import { DashboardRequestsSection } from "./DashboardRequestsSection";
import { DashboardOffersSection } from "./DashboardOffersSection";

const FAILURE_DAYS = 7;

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    { data: cards, error: cardsError },
    logsResult,
    repliesResult,
    myRequests,
    myOffers,
    unreadByRequest,
    categories,
    profileRow,
  ] = await Promise.all([
    supabase
      .from("child_cards")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.from("card_access_logs").select("*").order("created_at", { ascending: false }),
    supabase.from("child_replies").select("*").order("created_at", { ascending: false }),
    getMyHelpRequests(),
    getMyHelpOffers(),
    getUnreadHelpOffersByRequest(),
    getCategories(),
    supabase.from("profiles").select("is_anonymous").eq("id", user.id).single(),
  ]);

  const defaultIsAnonymous = profileRow?.data?.is_anonymous !== false;

  if (cardsError) {
    console.error("Dashboard fetch error:", cardsError.message);
  }

  const childCards = (cards ?? []) as ChildCardRow[];
  const hasCards = childCards.length > 0;

  const logsList = (logsResult.data ?? []) as CardAccessLogRow[];
  const logsByCard: Record<string, CardAccessLogRow[]> = {};
  logsList.forEach((log) => {
    if (!logsByCard[log.card_id]) logsByCard[log.card_id] = [];
    logsByCard[log.card_id].push(log);
  });

  const repliesList = (repliesResult.data ?? []) as ChildReplyRow[];
  const repliesByCard: Record<string, ChildReplyRow[]> = {};
  repliesList.forEach((r) => {
    if (!repliesByCard[r.card_id]) repliesByCard[r.card_id] = [];
    repliesByCard[r.card_id].push(r);
  });

  const sevenDaysAgo = new Date(
    Date.now() - FAILURE_DAYS * 24 * 60 * 60 * 1000
  );

  return (
    <section className="space-y-10" dir="rtl">
      <h1 className="text-3xl font-bold text-foreground">לוח בקרה</h1>

      {/* Section A: My Child Cards */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold text-foreground">כרטיסי הילד שלי</h2>
          {hasCards && (
            <Button asChild size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
              <Link href="/create-card" className="inline-flex items-center gap-2">
                <Plus className="size-4" aria-hidden />
                צור כרטיס חדש
              </Link>
            </Button>
          )}
        </div>
        {hasCards ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {childCards.map((card) => (
              <DashboardCard
                key={card.id}
                card={card}
                replies={repliesByCard[card.id] ?? []}
                logs={logsByCard[card.id] ?? []}
                failureDaysAgo={sevenDaysAgo}
              />
            ))}
          </div>
        ) : (
          <Card className="border-teal-200 dark:border-teal-800 border-dashed">
            <CardHeader className="text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground mb-2">
                <LayoutGrid className="size-7" aria-hidden />
              </div>
              <CardTitle className="text-xl">כרטיס מאובטח לילד</CardTitle>
              <CardDescription className="max-w-sm mx-auto">
                הורה מנוכר? צרו כרטיס עם מסר שרק הילד יוכל לפתוח.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-8">
              <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700 text-white">
                <Link href="/create-card">צור כרטיס</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Section 2: My Help Requests — same structure as Child Cards */}
      <DashboardRequestsSection
        requests={myRequests}
        categories={categories}
        defaultIsAnonymous={defaultIsAnonymous}
        unreadByRequest={unreadByRequest ?? {}}
      />

      {/* Section 3: My Help Offers — same structure as Child Cards */}
      <DashboardOffersSection offers={myOffers} categories={categories} />
    </section>
  );
}
