"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "בית", match: (path: string) => path === "/" },
  { href: "/about", label: "אודות", match: (path: string) => path.startsWith("/about") },
  { href: "/articles", label: "מאמרים", match: (path: string) => path.startsWith("/articles") },
  { href: "/songs", label: "שירים", match: (path: string) => path.startsWith("/songs") },
] as const;

function isAppRoute(path: string): boolean {
  return (
    path.startsWith("/dashboard") ||
    path.startsWith("/create-card") ||
    path.startsWith("/edit-card") ||
    path.startsWith("/view")
  );
}

const linkBase =
  "text-sm font-medium transition-colors hover:text-foreground";
const linkActive = "text-foreground font-semibold border-b-2 border-foreground pb-0.5";
const linkInactive = "text-foreground/80";

export function NavbarNav({ hasUser }: { hasUser: boolean }) {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-4" dir="rtl">
      <ul className="flex gap-6">
        {navLinks.map(({ href, label, match }) => (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                linkBase,
                match(pathname) ? linkActive : linkInactive
              )}
              aria-current={match(pathname) ? "page" : undefined}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
      {hasUser ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:inline" aria-hidden>
            מחובר
          </span>
          <Button
            asChild
            size="sm"
            className={cn(
              "shrink-0",
              isAppRoute(pathname) ? "bg-teal-600 hover:bg-teal-700 text-white" : "text-foreground/80 hover:text-foreground hover:bg-transparent"
            )}
            variant={isAppRoute(pathname) ? "default" : "ghost"}
          >
            <Link href="/dashboard" aria-current={isAppRoute(pathname) ? "page" : undefined}>
              לוח בקרה
            </Link>
          </Button>
          <form action={signOut} className="inline">
            <Button type="submit" variant="ghost" size="sm" className="shrink-0">
              התנתק
            </Button>
          </form>
        </div>
      ) : (
        <Button asChild size="sm" className="bg-teal-600 hover:bg-teal-700 text-white shrink-0">
          <Link href="/login">התחבר / הרשם</Link>
        </Button>
      )}
    </div>
  );
}
