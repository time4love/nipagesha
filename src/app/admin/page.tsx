import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Inbox,
  Flag,
  Heart,
  Users,
  Library,
  Music,
  FileText,
} from "lucide-react";
import { getAdminStats } from "./actions";

export const metadata = {
  title: "לוח בקרה ניהולי | ניפגשה",
  description: "ממשק ניהול האתר",
};

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-8" dir="rtl">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold text-foreground">לוח בקרה ניהולי</h1>
        <p className="mt-1 text-muted-foreground">
          שלום, הנה סיכום מצב המערכת ופעולות מהירות.
        </p>
      </header>

      {/* Section 1: Attention Needed */}
      <section aria-labelledby="attention-heading">
        <h2 id="attention-heading" className="mb-4 text-lg font-semibold text-foreground">
          דורש טיפול
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-destructive/40 bg-destructive/5 transition-shadow hover:shadow-md">
            <Link href="/admin/help-requests" className="block">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
                  <AlertCircle className="size-5" aria-hidden />
                </div>
                <CardTitle className="text-base">בקשות עזרה ממתינות לאישור</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <span className="text-2xl font-bold tabular-nums text-destructive">
                  {stats.pending_help_posts}
                </span>
                <p className="mt-1 text-sm font-medium text-destructive/90">מעבר לבקשות →</p>
              </CardContent>
            </Link>
          </Card>

          <Card className="border-orange-500/40 bg-orange-500/5 transition-shadow hover:shadow-md">
            <Link href="/admin/inbox" className="block">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/15 text-orange-600 dark:text-orange-400">
                  <Inbox className="size-5" aria-hidden />
                </div>
                <CardTitle className="text-base">פניות צור קשר חדשות</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <span className="text-2xl font-bold tabular-nums text-orange-600 dark:text-orange-400">
                  {stats.open_contact_messages}
                </span>
                <p className="mt-1 text-sm font-medium text-orange-600/90 dark:text-orange-400/90">
                  מעבר לתיבת פניות →
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card className="border-amber-500/40 bg-amber-500/5 transition-shadow hover:shadow-md">
            <Link href="/admin/reports" className="block">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <Flag className="size-5" aria-hidden />
                </div>
                <CardTitle className="text-base">דיווחים על תוכן</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <span className="text-2xl font-bold tabular-nums text-amber-600 dark:text-amber-400">
                  {stats.open_reports}
                </span>
                <p className="mt-1 text-sm font-medium text-amber-600/90 dark:text-amber-400/90">
                  מעבר לדיווחים →
                </p>
              </CardContent>
            </Link>
          </Card>
        </div>
      </section>

      {/* Section 2: System Health */}
      <section aria-labelledby="health-heading">
        <h2 id="health-heading" className="mb-4 text-lg font-semibold text-foreground">
          מדדי הצלחה
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-teal-500/30 bg-teal-500/5 transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400">
                <Heart className="size-5" aria-hidden />
              </div>
              <CardTitle className="text-base">כרטיסי ילד</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="mb-1">
                {stats.read_child_cards} נצפו מתוך {stats.total_child_cards} נוצרו
              </CardDescription>
              <span className="text-xl font-bold tabular-nums text-teal-600 dark:text-teal-400">
                {stats.total_child_cards > 0
                  ? Math.round((stats.read_child_cards / stats.total_child_cards) * 100)
                  : 0}
                %
              </span>
              <span className="mr-1 text-sm text-muted-foreground">נקראו</span>
            </CardContent>
          </Card>

          <Card className="border-blue-500/30 bg-blue-500/5 transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400">
                <Users className="size-5" aria-hidden />
              </div>
              <CardTitle className="text-base">משתמשים רשומים</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="mb-1">סך הפרופילים במערכת</CardDescription>
              <span className="text-2xl font-bold tabular-nums text-blue-600 dark:text-blue-400">
                {stats.total_users}
              </span>
            </CardContent>
          </Card>

          <Card className="border-cyan-500/30 bg-cyan-500/5 transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-600 dark:text-cyan-400">
                <Library className="size-5" aria-hidden />
              </div>
              <CardTitle className="text-base">מאגר תוכן</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="mb-1">שירים ומאמרים</CardDescription>
              <span className="text-2xl font-bold tabular-nums text-cyan-600 dark:text-cyan-400">
                {stats.total_songs + stats.total_articles}
              </span>
              <span className="mr-2 text-sm text-muted-foreground">
                ({stats.total_songs} שירים, {stats.total_articles} מאמרים)
              </span>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section 3: Quick Actions */}
      <section aria-labelledby="quick-actions-heading">
        <h2 id="quick-actions-heading" className="mb-4 text-lg font-semibold text-foreground">
          פעולות מהירות
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="default" className="gap-2">
            <Link href="/admin/songs/new">
              <Music className="size-4" aria-hidden />
              הוסף שיר חדש
            </Link>
          </Button>
          <Button asChild variant="secondary" size="default" className="gap-2">
            <Link href="/admin/articles/new">
              <FileText className="size-4" aria-hidden />
              כתוב מאמר חדש
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
