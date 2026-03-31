import { createClient } from "@/lib/supabase/server";
import type { EvidenceItemWithSource } from "@/lib/supabase/types";
import { EvidenceBankClient } from "@/components/evidence/EvidenceBankClient";

export const metadata = {
  title: "בנק הראיות | ניפגשה",
  description:
    "מסמכים רשמיים, ציטוטים וניתוח — תיק חקירה דיגיטלי לשקיפות ומעקב אזרחי.",
};

export default async function EvidencePage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("evidence_items")
    .select("*, sources(*)")
    .order("evidence_number", { ascending: true });

  const rows = (data ?? []) as EvidenceItemWithSource[];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto max-w-4xl px-4 py-12 sm:py-16">
        {error ? (
          <div
            className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center text-foreground"
            role="alert"
          >
            <p className="font-medium text-destructive">לא ניתן לטעון את בנק הראיות כרגע.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              נסו שוב מאוחר יותר. אם הבעיה נמשכת, ייתכן שחסרות טבלאות או הרשאות ב-Supabase.
            </p>
          </div>
        ) : (
          <EvidenceBankClient items={rows} />
        )}
      </div>
    </div>
  );
}
