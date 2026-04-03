import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyHelpRequests, getUnreadHelpOffersByRequest } from "./actions";
import { HelpSectionClient } from "./HelpSectionClient";

export default async function DashboardHelpPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [requests, profileRow, unreadByRequest] = await Promise.all([
    getMyHelpRequests(),
    supabase.from("profiles").select("is_anonymous").eq("id", user.id).single(),
    getUnreadHelpOffersByRequest(),
  ]);

  const profile = profileRow.data;
  const defaultIsAnonymous = profile?.is_anonymous !== false;

  return (
    <section className="space-y-8">
      <h1 className="text-3xl font-bold text-foreground">הבקשות שלי</h1>
      <p className="text-muted-foreground">
        ניהול הבקשות שפרסמתם בלוח העזרה והצעות שהתקבלו.
      </p>
      <HelpSectionClient
        requests={requests}
        defaultIsAnonymous={defaultIsAnonymous}
        unreadByRequest={unreadByRequest}
      />
    </section>
  );
}
