import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { NavbarNav } from "./navbar-nav";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const admin = isAdmin(user?.email ?? undefined);

  return (
    <header
      className="sticky top-0 z-[60] w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-x-hidden"
      role="banner"
    >
      <nav
        className="container mx-auto flex h-14 min-w-0 items-center justify-between gap-2 px-4"
        aria-label="ניווט ראשי"
        dir="rtl"
      >
        <Link
          href="/"
          className="shrink-0 text-xl font-semibold hover:opacity-80 transition-opacity"
        >
          ניפגשה
        </Link>
        <NavbarNav hasUser={!!user} isAdmin={admin} />
      </nav>
    </header>
  );
}
