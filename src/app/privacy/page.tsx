import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "מדיניות פרטיות | ניפגשה",
  description: "מדיניות הפרטיות של אתר ניפגשה",
};

export default function PrivacyPage() {
  return (
    <main
      className="container mx-auto px-4 py-10 max-w-3xl"
      dir="rtl"
      aria-label="מדיניות פרטיות"
    >
      <article className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-p:leading-relaxed prose-ul:my-4 prose-ol:my-4 prose-li:my-1 text-foreground">
        <h1>מדיניות פרטיות – אתר &quot;ניפגשה&quot;</h1>
        <p>
          אנו מכבדים את פרטיותך ורואים בהגנה על המידע האישי ערך עליון.
        </p>

        <h2>1. המידע שאנו אוספים</h2>
        <p>
          שם, אימייל, פרטי הילד (לצורך חיפוש בלבד: שם ושנת לידה), וכתובת IP (לצורכי אבטחה בלבד).
        </p>

        <h2>2. הצפנה ופרטיות המסר</h2>
        <p>
          תוכן המסרים האישיים והתמונות המצורפות אליהם מוצפנים במפתח הידוע רק לך ולילדך. לשרתי האתר אין גישה למידע זה בצורתו הגלויה.
        </p>

        <h2>3. העברת מידע</h2>
        <p>
          אנו לא מוכרים את המידע שלך. המידע נשמר על שרתי ענן מאובטחים (Supabase, Vercel). במקרה של צו שיפוטי מחייב, נאלץ למסור את פרטי המשתמש (למעט התוכן המוצפן שאינו נגיש לנו).
        </p>

        <h2>4. הזכות להישכח</h2>
        <p>
          אתה זכאי בכל עת למחוק את חשבונך באופן מלא דרך אזור הפרופיל באתר. פעולה זו תמחק לצמיתות את כל המידע המקושר אליך משרתינו.
        </p>

        <h2>5. עוגיות (Cookies)</h2>
        <p>
          האתר משתמש ב-Cookies לצורך זיהוי המשתמש המחובר ותפעול תקין.
        </p>
      </article>
    </main>
  );
}
