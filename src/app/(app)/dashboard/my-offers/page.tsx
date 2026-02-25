import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyHelpOffers } from "../help/actions";
import { getCategories } from "@/app/help/actions";
import { MyOffersSectionClient } from "./MyOffersSectionClient";

export default async function MyOffersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [offers, categories] = await Promise.all([
    getMyHelpOffers(),
    getCategories(),
  ]);

  return (
    <section className="space-y-8" dir="rtl">
      <h1 className="text-3xl font-bold text-foreground">הצעות העזרה שלי</h1>
      <p className="text-muted-foreground">
        ניהול ההצעות שפרסמתם בלוח העזרה. הורים יכולים ליצור איתכם קשר דרך האתר.
      </p>
      <MyOffersSectionClient offers={offers} categories={categories} />
    </section>
  );
}
