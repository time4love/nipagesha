"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
import { signOut } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/** Nav links without Home (logo links to /). Dashboard and Admin shown conditionally. */
const navLinks = [
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

const linkBase = "text-sm font-medium transition-colors hover:text-foreground";
const linkActive = "text-foreground font-semibold border-b-2 border-foreground pb-0.5";
const linkInactive = "text-foreground/80";

interface NavLinkProps {
  href: string;
  label: string;
  isActive: boolean;
}

/** Single nav link for desktop list */
function NavLink({ href, label, isActive }: NavLinkProps) {
  return (
    <li>
      <Link
        href={href}
        className={cn(linkBase, isActive ? linkActive : linkInactive)}
        aria-current={isActive ? "page" : undefined}
      >
        {label}
      </Link>
    </li>
  );
}

interface MobileNavLinkProps {
  href: string;
  label: string;
  isActive: boolean;
  onClose: () => void;
}

/** Large tap-friendly link for mobile sheet */
function MobileNavLink({ href, label, isActive, onClose }: MobileNavLinkProps) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClose}
        className={cn(
          "block w-full py-3 text-right text-lg font-medium transition-colors hover:text-foreground",
          isActive ? "text-foreground font-semibold" : "text-foreground/80"
        )}
        aria-current={isActive ? "page" : undefined}
      >
        {label}
      </Link>
    </li>
  );
}

export interface NavbarNavProps {
  hasUser: boolean;
  isAdmin: boolean;
}

export function NavbarNav({ hasUser, isAdmin }: NavbarNavProps) {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);

  const closeSheet = () => setSheetOpen(false);

  return (
    <>
      {/* Desktop: nav links in center/left (RTL: second in row) */}
      <div className="hidden md:flex flex-1 min-w-0 items-center justify-center gap-6">
        <ul className="flex gap-6">
          {navLinks.map(({ href, label, match }) => (
            <NavLink
              key={href}
              href={href}
              label={label}
              isActive={match(pathname)}
            />
          ))}
          {hasUser && (
            <NavLink
              href="/dashboard"
              label="לוח בקרה"
              isActive={isAppRoute(pathname)}
            />
          )}
          {isAdmin && (
            <NavLink href="/admin" label="ניהול" isActive={pathname.startsWith("/admin")} />
          )}
        </ul>
      </div>

      {/* Desktop: user / login on far left (RTL: third in row) */}
      <div className="hidden md:flex items-center gap-2 shrink-0">
        {hasUser ? (
          <>
            <span className="text-sm text-muted-foreground" aria-hidden>
              מחובר
            </span>
            <Button
              asChild
              size="sm"
              className={cn(
                "shrink-0",
                isAppRoute(pathname)
                  ? "bg-teal-600 hover:bg-teal-700 text-white"
                  : "text-foreground/80 hover:text-foreground hover:bg-transparent"
              )}
              variant={isAppRoute(pathname) ? "default" : "ghost"}
            >
              <Link
                href="/dashboard"
                aria-current={isAppRoute(pathname) ? "page" : undefined}
              >
                לוח בקרה
              </Link>
            </Button>
            <form action={signOut} className="inline">
              <Button type="submit" variant="ghost" size="sm" className="shrink-0">
                התנתק
              </Button>
            </form>
          </>
        ) : (
          <Button
            asChild
            size="sm"
            className="bg-teal-600 hover:bg-teal-700 text-white shrink-0"
          >
            <Link href="/login">התחבר / הרשם</Link>
          </Button>
        )}
      </div>

      {/* Mobile: hamburger only (no text links); sheet contains nav */}
      <div className="flex md:hidden items-center shrink-0">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              aria-label="תפריט ניווט"
            >
              <Menu className="size-6" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="z-[100] w-[85vw] max-w-sm"
            dir="rtl"
          >
            <SheetHeader>
              <SheetTitle className="text-right">ניווט</SheetTitle>
            </SheetHeader>
            <nav aria-label="ניווט תפריט" className="mt-6">
              <ul className="flex flex-col gap-1">
                {navLinks.map(({ href, label, match }) => (
                  <MobileNavLink
                    key={href}
                    href={href}
                    label={label}
                    isActive={match(pathname)}
                    onClose={closeSheet}
                  />
                ))}
                {hasUser && (
                  <MobileNavLink
                    href="/dashboard"
                    label="לוח בקרה"
                    isActive={isAppRoute(pathname)}
                    onClose={closeSheet}
                  />
                )}
                {isAdmin && (
                  <MobileNavLink
                    href="/admin"
                    label="ניהול"
                    isActive={pathname.startsWith("/admin")}
                    onClose={closeSheet}
                  />
                )}
              </ul>
              <div className="mt-6 flex flex-col gap-2 border-t pt-4">
                {hasUser ? (
                  <>
                    <form action={signOut} className="w-full">
                      <Button
                        type="submit"
                        variant="ghost"
                        size="lg"
                        className="w-full justify-center text-lg"
                        onClick={closeSheet}
                      >
                        התנתק
                      </Button>
                    </form>
                  </>
                ) : (
                  <Button asChild size="lg" className="w-full justify-center bg-teal-600 hover:bg-teal-700 text-white text-lg">
                    <Link href="/login" onClick={closeSheet}>
                      התחבר / הרשם
                    </Link>
                  </Button>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
