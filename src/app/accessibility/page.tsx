import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "הצהרת נגישות | ניפגשה",
  description: "הצהרת הנגישות של אתר ניפגשה",
};

export default function AccessibilityPage() {
  return (
    <main
      className="container mx-auto px-4 py-10 max-w-3xl"
      dir="rtl"
      aria-label="הצהרת נגישות"
    >
      <article className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-p:leading-relaxed text-foreground">
        <h1>הצהרת נגישות</h1>
        <p>
          אתר &quot;ניפגשה&quot; שואף להעניק חוויית גלישה נגישה לכולם. אנו פועלים להתאמת האתר לעקרונות תקן WCAG 2.1 ברמת AA ככל האפשר, לרבות ניווט מקלדת, תמיכה בקוראי מסך, ניגודיות מספקת וטקסט ברור.
        </p>
        <p>
          אם נתקלת בבעיית נגישות או יש לך הצעה לשיפור, נשמח לשמוע ממך דרך דף צור קשר.
        </p>
      </article>
    </main>
  );
}
