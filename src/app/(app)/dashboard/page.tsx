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
import { Plus, LayoutGrid, HandHeart } from "lucide-react";
import { DashboardCard } from "./DashboardCard";
import { getUnreadHelpOffersCount } from "./help/actions";

const FAILURE_DAYS = 7;

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: cards, error } = await supabase
    .from("child_cards")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Dashboard fetch error:", error.message);
  }

  const childCards = (cards ?? []) as ChildCardRow[];
  const isEmpty = childCards.length === 0;

  // RLS ensures we only get logs for this user's cards; no need to filter by card_id
  let logsByCard: Record<string, CardAccessLogRow[]> = {};
  const { data: logs } = await supabase
    .from("card_access_logs")
    .select("*")
    .order("created_at", { ascending: false });
  const list = (logs ?? []) as CardAccessLogRow[];
  list.forEach((log) => {
    if (!logsByCard[log.card_id]) logsByCard[log.card_id] = [];
    logsByCard[log.card_id].push(log);
  });

  // Child replies: RLS returns only this user's (parent) replies
  let repliesByCard: Record<string, ChildReplyRow[]> = {};
  const { data: replies } = await supabase
    .from("child_replies")
    .select("*")
    .order("created_at", { ascending: false });
  const repliesList = (replies ?? []) as ChildReplyRow[];
  repliesList.forEach((r) => {
    if (!repliesByCard[r.card_id]) repliesByCard[r.card_id] = [];
    repliesByCard[r.card_id].push(r);
  });

  const now = new Date();
  const sevenDaysAgo = new Date(
    now.getTime() - FAILURE_DAYS * 24 * 60 * 60 * 1000
  );

  const unreadHelpOffersCount = await getUnreadHelpOffersCount();

  return (
    <section className="space-y-8" dir="rtl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-foreground">לוח בקרה</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm" className="shrink-0 relative">
            <Link href="/dashboard/help" className="inline-flex items-center gap-2">
              <HandHeart className="size-4" aria-hidden />
              הבקשות שלי
              {unreadHelpOffersCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 rtl:right-auto rtl:-left-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-amber-500 text-amber-950 min-w-[1.25rem] text-center"
                  aria-label={`${unreadHelpOffersCount} הצעות עזרה חדשות`}
                >
                  {unreadHelpOffersCount}
                </span>
              )}
            </Link>
          </Button>
          <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white shrink-0">
            <Link href="/create-card" className="inline-flex items-center gap-2">
              <Plus className="size-4" aria-hidden />
              צור כרטיס חדש
            </Link>
          </Button>
        </div>
      </div>

      {isEmpty ? (
        <Card className="border-teal-200 dark:border-teal-800 border-dashed">
          <CardHeader className="text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground mb-2">
              <LayoutGrid className="size-7" aria-hidden />
            </div>
            <CardTitle className="text-xl">עדיין אין כרטיסים</CardTitle>
            <CardDescription className="max-w-sm mx-auto">
              צרו את כרטיס הילד הראשון שלכם והשאירו מסר מאובטח שרק הילד יוכל לפתוח.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700 text-white">
              <Link href="/create-card">צור את הכרטיס הראשון</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
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
      )}
    </section>
  );
}
