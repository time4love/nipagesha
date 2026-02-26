import Link from "next/link";
import { Github } from "lucide-react";

const currentYear = new Date().getFullYear();

const GITHUB_REPO_URL = "https://github.com/time4love/nipagesha";

const footerLinks = [
  { href: "/terms", label: "תנאי שימוש" },
  { href: "/privacy", label: "מדיניות פרטיות" },
  { href: "/accessibility", label: "הצהרת נגישות" },
  { href: "/contact", label: "צור קשר" },
] as const;

export function Footer() {
  return (
    <footer
      className="mt-auto bg-gray-100 border-t border-border py-6 text-sm"
      role="contentinfo"
      aria-label="פוטר"
    >
      <div
        className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right"
        dir="rtl"
      >
        <div className="order-2 sm:order-1 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-muted-foreground">
          <p>© {currentYear} ניפגשה. כל הזכויות שמורות.</p>
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="קוד פתוח ב-GitHub (נפתח בחלון חדש)"
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
          >
            <Github className="h-4 w-4 shrink-0" aria-hidden />
            <span>קוד פתוח ב-GitHub</span>
          </a>
        </div>
        <ul className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2 order-1 sm:order-2">
          {footerLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
