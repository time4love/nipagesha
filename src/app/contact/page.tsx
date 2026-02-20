import { createClient } from "@/lib/supabase/server";
import { ContactForm } from "./ContactForm";

export const metadata = {
  title: "צור קשר / דיווח על תקלה | ניפגשה",
  description: "יצירת קשר, תמיכה ודיווח על תקלות או תוכן לא הולם",
};

export default async function ContactPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialName = "";
  let initialEmail = "";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();
    initialName = profile?.display_name?.trim() ?? user.user_metadata?.full_name ?? "";
    initialEmail = user.email ?? "";
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10" dir="rtl">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          צור קשר / דיווח על תקלה
        </h1>
        <p className="mt-2 text-muted-foreground">
          יש לכם שאלה, דיווח על באג או תוכן שלא מתאים? מלאו את הטופס ונחזור אליכם.
        </p>
      </header>
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <ContactForm initialName={initialName} initialEmail={initialEmail} />
      </div>
    </div>
  );
}
