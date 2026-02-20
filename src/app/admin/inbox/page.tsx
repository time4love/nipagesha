import { getContactSubmissions } from "./actions";
import { AdminInboxClient } from "./AdminInboxClient";

export const metadata = {
  title: "תיבת פניות | ניהול | ניפגשה",
  description: "פניות משתמשים ודיווחים",
};

export default async function AdminInboxPage() {
  const submissions = await getContactSubmissions();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">תיבת פניות</h1>
      <p className="text-muted-foreground">
        פניות מטופס צור קשר ודיווחים על תוכן. ניתן לסנן לפי סטטוס ולסמן כטופל.
      </p>
      <AdminInboxClient submissions={submissions} />
    </div>
  );
}
