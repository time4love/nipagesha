"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CONSENT_KEY = "nipagesha-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState<boolean | null>(null);

  useEffect(() => {
    const hasConsent = typeof window !== "undefined" && window.localStorage.getItem(CONSENT_KEY) === "true";
    setVisible(!hasConsent);
  }, []);

  const handleAccept = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CONSENT_KEY, "true");
      setVisible(false);
    }
  };

  if (visible !== true) return null;

  return (
    <div
      role="dialog"
      aria-label="הודעת עוגיות"
      className="fixed bottom-0 left-0 right-0 z-[100] border-t border-border bg-card px-4 py-3 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]"
    >
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center sm:justify-between sm:text-right">
        <p className="text-sm text-muted-foreground">
          האתר משתמש בקובצי עוגיות (Cookies) נחוצים לצורך תפעולו התקין וחווית השימוש.
        </p>
        <div className="flex items-center gap-3">
          <Link
            href="/privacy"
            className="text-sm font-medium text-teal-700 underline underline-offset-2 transition hover:text-teal-800"
          >
            מדיניות פרטיות
          </Link>
          <button
            type="button"
            onClick={handleAccept}
            className="rounded-md border border-border bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            הבנתי, תודה
          </button>
        </div>
      </div>
    </div>
  );
}
