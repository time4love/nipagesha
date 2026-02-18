import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NavbarNav } from "./navbar-nav";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="banner"
    >
      <nav
        className="container mx-auto flex h-14 items-center justify-between px-4"
        aria-label="ניווט ראשי"
      >
        <Link
          href="/"
          className="text-xl font-semibold hover:opacity-80 transition-opacity"
        >
          ניפגשה
        </Link>
        <NavbarNav hasUser={!!user} />
      </nav>
    </header>
  );
}
