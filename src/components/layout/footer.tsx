import Link from "next/link";

export function Footer() {
  return (
    <footer
      className="border-t py-8 mt-auto"
      role="contentinfo"
      aria-label="פוטר"
    >
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4" dir="rtl">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} ניפגשה. פרטיות ובטיחות בראש.
        </p>
        <ul className="flex gap-6">
          <li>
            <Link
              href="/about"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              אודות
            </Link>
          </li>
          <li>
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              בית
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
