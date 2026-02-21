import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileForm } from "./ProfileForm";
import { DeleteAccountSection } from "./DeleteAccountSection";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profileRow) {
    return (
      <section className="space-y-6" dir="rtl">
        <h1 className="text-3xl font-bold text-foreground">פרופיל</h1>
        <Card>
          <CardHeader>
            <CardTitle>לא נמצא פרופיל</CardTitle>
            <CardDescription>
              הפרופיל שלך טרם נוצר. נסה לרענן את הדף או צור קשר עם התמיכה.
            </CardDescription>
          </CardHeader>
        </Card>
        <div className="max-w-2xl mt-8">
          <DeleteAccountSection />
        </div>
      </section>
    );
  }

  const profile = {
    id: profileRow.id,
    display_name: profileRow.display_name ?? "",
    avatar_url: profileRow.avatar_url,
    is_anonymous: Boolean(profileRow.is_anonymous),
    privacy_level: profileRow.privacy_level ?? "registered_only",
    parent_role: profileRow.parent_role ?? null,
    created_at: profileRow.created_at,
    updated_at: profileRow.updated_at,
  };

  return (
    <section className="space-y-6" dir="rtl">
      <h1 className="text-3xl font-bold text-foreground">הגדרות פרופיל</h1>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>פרופיל משתמש</CardTitle>
          <CardDescription>
            השם והתמונה שלך יכולים להופיע בלוח העזרה. תוכלו תמיד לבחור להופיע כאנונימיים.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm profile={profile} />
        </CardContent>
      </Card>

      <div className="max-w-2xl mt-8">
        <DeleteAccountSection />
      </div>
    </section>
  );
}
