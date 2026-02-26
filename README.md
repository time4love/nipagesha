<div dir="rtl" align="center">

# ניפגשה

<img src="https://www.nipagesha.co.il/logo.avif" alt="לוגו ניפגשה" width="200" />

### מחברים מחדש הורים וילדים

[![ניפגשה](https://img.shields.io/badge/ניפגשה-קוד_פתוח-blue?style=flat)](https://github.com/time4love/nipagesha)

</div>

---

<div dir="rtl">

## מה זה ניפגשה?

**ניפגשה** היא פלטפורמה שמאפשרת להורים שהקשר עם ילדיהם נותק — להשאיר מסר מאובטח ופרטי. רק הילד יכול לפתוח את המסר.

- **פרטיות** — המסר מוצפן בצד הלקוח; השרת לא רואה את התוכן.
- **אמון** — הקוד פתוח (Open Source) כך שניתן לוודא שהמערכת עושה בדיוק מה שהיא מצהירה.
- **בטיחות** — שאלת אבטחה מגנה על המסר; רק מי שיודע את התשובה יכול לגשת אליו.

האתר מיועד למשפחות במצבים מורכבים, ומאפשר תקשורת ראשונית מכובדת ובטוחה.

</div>

---

<div dir="rtl">

## טכנולוגיות

- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Shadcn/UI
- **Backend:** Supabase (Auth, PostgreSQL, RLS, Storage)
- **אבטחה:** הצפנה בצד הלקוח (Web Crypto), עוגיות מינימליות, YouTube במצב פרטיות (nocookie)

</div>

---

<div dir="rtl">

## הרצה מקומית (למפתחים)

1. **שכפול הפרויקט והתקנת תלויות:**

```bash
git clone https://github.com/time4love/nipagesha.git
cd nipagesha
npm install
```

2. **הגדרת סביבה:** העתק את `.env.example` ל־`.env.local` והגדר:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

(לפונקציונליות מלאה — גם מפתחות שרת ו־Resend לפי הצורך.)

3. **הפעלת שרת פיתוח:**

```bash
npm run dev
```

פתח [http://localhost:3000](http://localhost:3000) בדפדפן.

</div>

---

<div dir="rtl" align="center">

## רישיון ותרומה

הפרויקט פתוח לצפייה ולתרומה. אם מצאת באג או רוצה להציע שיפור — נשמח ל־Issue או Pull Request.

**[→ לפרויקט ב-GitHub](https://github.com/time4love/nipagesha)**

</div>
