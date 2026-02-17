import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { ChildCardRow } from "@/lib/supabase/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid } from "lucide-react";

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

  return (
    <section className="space-y-8" dir="rtl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-foreground">לוח בקרה</h1>
        <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white shrink-0">
          <Link href="/create-card" className="inline-flex items-center gap-2">
            <Plus className="size-4" aria-hidden />
            צור כרטיס חדש
          </Link>
        </Button>
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
            <Card
              key={card.id}
              className="border-teal-100 dark:border-teal-900/50"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  {card.child_first_name} {card.child_last_name}
                </CardTitle>
                <CardDescription>
                  שנת לידה: {card.birth_year} • שאלת אבטחה מוגדרת
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex flex-col gap-2">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  ההודעה מוצפנת ומוגנת. רק הילד יוכל לפתוח אותה עם תשובת האבטחה.
                </p>
                <Button variant="outline" size="sm" asChild className="w-fit">
                  <Link href={`/view/${card.id}`}>צפה במסר</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
