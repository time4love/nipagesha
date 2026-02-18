import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Music, FileText } from "lucide-react";

export const metadata = {
  title: "ניהול | ניפגשה",
  description: "ממשק ניהול האתר",
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">דשבורד ניהול</h1>
      <p className="text-muted-foreground">
        בחרו אזור לניהול מהרשימה או מהתפריט.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="transition-shadow hover:shadow-md">
          <Link href="/admin/songs" className="block">
            <CardHeader className="flex flex-row items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Music className="size-5" aria-hidden />
              </div>
              <div>
                <CardTitle className="text-lg">ניהול שירים</CardTitle>
                <CardDescription>
                  הוספה, עריכה ומחיקה של שירים (שירי הורים)
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <span className="text-sm font-medium text-primary">
                מעבר לניהול שירים →
              </span>
            </CardContent>
          </Link>
        </Card>
        <Card className="transition-shadow hover:shadow-md">
          <Link href="/admin/articles" className="block">
            <CardHeader className="flex flex-row items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="size-5" aria-hidden />
              </div>
              <div>
                <CardTitle className="text-lg">ניהול מאמרים</CardTitle>
                <CardDescription>
                  הוספה, עריכה ומחיקה של מאמרים (וידאו או תמונה)
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <span className="text-sm font-medium text-primary">
                מעבר לניהול מאמרים →
              </span>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
