"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const LOGO = {
  src: "/logo.avif",
  alt: "ניפגשה",
  width: 160,
  height: 50,
  className: "h-10 w-auto object-contain",
} as const;

const navLinks = [
  { href: "/about", label: "אודות", match: (path: string) => path.startsWith("/about") },
  { href: "/contact", label: "צור קשר", match: (path: string) => path.startsWith("/contact") },
  { href: "/articles", label: "מאמרים", match: (path: string) => path.startsWith("/articles") },
  { href: "/songs", label: "שירים", match: (path: string) => path.startsWith("/songs") },
  { href: "/help", label: "לוח עזרה", match: (path: string) => path.startsWith("/help") },
] as const;

function isAppRoute(path: string): boolean {
  return (
    path.startsWith("/dashboard") ||
    path.startsWith("/create-card") ||
    path.startsWith("/edit-card") ||
    path.startsWith("/view") ||
    path.startsWith("/profile")
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

export interface NavbarClientProps {
  user: User | null;
  isAdmin: boolean;
}

export function NavbarClient({ user, isAdmin }: NavbarClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const supabase = createClient();

  const closeSheet = () => setSheetOpen(false);
  const hasUser = !!user;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

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

        {/* Desktop: nav links */}
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

        {/* Desktop: user / login */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {hasUser ? (
            <>
              <span className="text-sm text-muted-foreground" aria-hidden>
                מחובר
              </span>
              <Button asChild size="sm" variant="ghost" className="shrink-0 text-foreground/80 hover:text-foreground">
                <Link href="/profile" aria-current={pathname.startsWith("/profile") ? "page" : undefined}>
                  פרופיל
                </Link>
              </Button>
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
                <Link href="/dashboard" aria-current={isAppRoute(pathname) ? "page" : undefined}>
                  לוח בקרה
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="shrink-0" onClick={handleSignOut}>
                התנתק
              </Button>
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

        {/* Mobile: hamburger + sheet */}
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
                    <>
                      <MobileNavLink
                        href="/profile"
                        label="פרופיל"
                        isActive={pathname.startsWith("/profile")}
                        onClose={closeSheet}
                      />
                      <MobileNavLink
                        href="/dashboard"
                        label="לוח בקרה"
                        isActive={isAppRoute(pathname)}
                        onClose={closeSheet}
                      />
                    </>
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
                    <Button
                      variant="ghost"
                      size="lg"
                      className="w-full justify-center text-lg"
                      onClick={() => {
                        closeSheet();
                        handleSignOut();
                      }}
                    >
                      התנתק
                    </Button>
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
      </nav>
    </header>
  );
}
