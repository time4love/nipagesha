"use client";

import Link from "next/link";

const navLinks = [
  { href: "/", label: "בית" },
  { href: "/about", label: "אודות" },
  { href: "/dashboard", label: "לוח בקרה" },
  { href: "/create-card", label: "צור כרטיס" },
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
        <ul className="flex gap-6" dir="rtl">
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
      </nav>
    </header>
  );
}
