import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { LayoutDashboard, Music, FileText, HandHeart, Inbox } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // --- Debug: visible in Vercel Dashboard → Logs ---
  console.log("--- ADMIN LAYOUT DEBUG ---");
  console.log("User found:", user ? "YES" : "NO");
  if (user) {
    console.log("User Email:", user.email);
    console.log("Is Admin Check:", isAdmin(user.email));
  }
  if (error) {
    console.error("Auth Error:", error.message);
  }
  // -------------------------------------------------

  if (error || !user) {
    console.log("Redirecting to login because no user found.");
    redirect("/login");
  }

  if (!isAdmin(user.email)) {
    console.log("Redirecting to home because user is NOT admin.");
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 container mx-auto px-4 py-6" dir="rtl">
        <aside className="w-48 shrink-0 border-l pl-6">
          <nav className="flex flex-col gap-2" aria-label="ניווט ניהול">
            <Link
              href="/admin"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <LayoutDashboard className="size-4" aria-hidden />
              דשבורד
            </Link>
            <Link
              href="/admin/songs"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Music className="size-4" aria-hidden />
              ניהול שירים
            </Link>
            <Link
              href="/admin/articles"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <FileText className="size-4" aria-hidden />
              ניהול מאמרים
            </Link>
            <Link
              href="/admin/help-requests"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <HandHeart className="size-4" aria-hidden />
              בקשות לוח עזרה
            </Link>
            <Link
              href="/admin/inbox"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Inbox className="size-4" aria-hidden />
              תיבת פניות
            </Link>
          </nav>
        </aside>
        <main className="flex-1 min-w-0 pr-6">{children}</main>
      </div>
    </div>
  );
}
