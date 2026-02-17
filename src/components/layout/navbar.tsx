"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "בית" },
  { href: "/about", label: "אודות" },
  { href: "/articles", label: "מאמרים" },
] as const;

export function Navbar() {
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
        <div className="flex items-center gap-4" dir="rtl">
          <ul className="flex gap-6">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <Button asChild size="sm" className="bg-teal-600 hover:bg-teal-700 text-white shrink-0">
            <Link href="/login">התחבר / הרשם</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
