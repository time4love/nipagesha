import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { NavbarNav } from "./navbar-nav";

const LOGO = {
  src: "/logo.avif",
  alt: "ניפגשה",
  width: 160,
  height: 50,
  className: "h-10 w-auto object-contain",
} as const;

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
          className="shrink-0 hover:opacity-80 transition-opacity"
        >
          <Image
            src={LOGO.src}
            alt={LOGO.alt}
            width={LOGO.width}
            height={LOGO.height}
            className={LOGO.className}
            priority
          />
        </Link>
        <NavbarNav hasUser={!!user} isAdmin={admin} />
      </nav>
    </header>
  );
}
