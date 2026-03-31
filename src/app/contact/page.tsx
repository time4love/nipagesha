import { createClient } from "@/lib/supabase/server";
import { ContactForm } from "./ContactForm";
import { contactCategories } from "./constants";
import type { ContactFormData } from "./constants";

export const metadata = {
  title: "צור קשר / דיווח על תקלה | ניפגשה",
  description: "יצירת קשר, תמיכה ודיווח על תקלות או תוכן לא הולם",
};

function pickFirst(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const rawCat = pickFirst(sp.category);
  const isValidCategory =
    rawCat !== undefined &&
    (contactCategories as readonly string[]).includes(rawCat);
  const defaultCategory: ContactFormData["category"] = isValidCategory
    ? (rawCat as ContactFormData["category"])
    : "general";

  const referenceId = pickFirst(sp.reference_id)?.trim() || undefined;
  const referenceType = pickFirst(sp.reference_type)?.trim() || undefined;
  const songTitle = pickFirst(sp.song_title)?.trim() || undefined;

  let defaultSubject = "";
  if (defaultCategory === "song_request") {
    defaultSubject = songTitle ? `בקשה לשיר דומה: ${songTitle}` : "בקשה לשיר";
  }

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
          יש לכם שאלה, מידע נוסף לאתר, או רצונכם בשיר משלכם? מלאו את הטופס ונחזור אליכם.
        </p>
      </header>
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <ContactForm
          initialName={initialName}
          initialEmail={initialEmail}
          defaultCategory={defaultCategory}
          defaultSubject={defaultSubject}
          referenceId={referenceId}
          referenceType={referenceType}
        />
      </div>
    </div>
  );
}
