import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Search,
  KeyRound,
  Shield,
  Lock,
  MessageCircle,
} from "lucide-react";

const steps = [
  {
    icon: MessageCircle,
    title: "הורה יוצר כרטיס פרטי",
    description: "הורה משאיר הודעה מוצפנת לילד, עם שאלת אבטחה שרק הילד יכול לדעת את התשובה לה.",
  },
  {
    icon: Search,
    title: "הילד מחפש את שמו",
    description: "הילד מחפש את שמו במערכת. אם נמצא כרטיס עבורו, הוא יראה הודעה שיש מסר.",
  },
  {
    icon: KeyRound,
    title: "תשובה לסוד וחשיפת המסר",
    description: "הילד עונה על שאלת האבטחה. רק תשובה נכונה תפענח את ההודעה — ואף אחד אחר לא יראה אותה.",
  },
] as const;

export const metadata = {
  title: "אודות ניפגשה | חיבור מחדש בין הורים לילדים",
  description:
    "ניפגשה מאפשרת להורים שהקשר עם ילדיהם נותק להשאיר מסר מאובטח. למדו איך זה עובד ומדוע הפרטיות והאבטחה במרכז.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen" dir="rtl">
      {/* Header & Vision */}
      <section
        className="relative overflow-hidden px-4 py-16 sm:py-20 md:py-24"
        aria-labelledby="about-heading"
      >
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-b from-teal-50/80 via-sky-50/50 to-background dark:from-teal-950/30 dark:via-sky-950/20 dark:to-background"
          aria-hidden
        />
        <div className="container mx-auto max-w-3xl text-center">
          <h1
            id="about-heading"
            className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl"
          >
            אודות ניפגשה
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            ניפגשה נולדה מתוך הרצון לחבר מחדש בין הורים לילדים כשהקשר נותק.
            אנחנו מאמינים שכל ילד וילדה זכאים לדעת שהוריהם חושבים עליהם ואוהבים
            אותם — ושכל הורה יכול להעביר מסר פרטי ובטוח, גם כשהדרך הרגילה
            חסומה. הפלטפורמה שלנו נותנת כלים עדינים ומכובדים לפתיחת דלת לתקשורת
            עתידית.
          </p>
        </div>
      </section>

      {/* How it Works */}
      <section
        className="border-t bg-muted/30 px-4 py-16 sm:py-20"
        aria-labelledby="how-it-works-heading"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2
              id="how-it-works-heading"
              className="text-3xl font-bold text-foreground sm:text-4xl"
            >
              איך זה עובד
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              שלושה צעדים פשוטים לחיבור מחדש
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card
                  key={step.title}
                  className="border-teal-100 dark:border-teal-900/50 bg-card/80 backdrop-blur"
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <span
                        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400"
                        aria-hidden
                      >
                        <Icon className="size-5" />
                      </span>
                      <span className="text-sm font-medium text-muted-foreground">
                        שלב {index + 1}
                      </span>
                    </div>
                    <CardTitle className="text-right">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-right">
                      {step.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security & Privacy */}
      <section
        className="px-4 py-16 sm:py-20"
        aria-labelledby="security-heading"
      >
        <div className="container mx-auto max-w-3xl">
          <Card className="border-teal-200 bg-gradient-to-b from-teal-50/50 to-card dark:border-teal-800 dark:from-teal-950/20 dark:to-card">
            <CardHeader className="text-center sm:text-right">
              <div className="mx-auto sm:mx-0 flex size-12 items-center justify-center rounded-full bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400 mb-2">
                <Shield className="size-6" aria-hidden />
              </div>
              <CardTitle id="security-heading" className="text-2xl">
                אבטחה ופרטיות
              </CardTitle>
              <CardDescription className="text-base text-right max-w-none">
                ההודעה מוצפנת אצלכם בדפדפן לפני שליחה. השרת לא רואה את תוכן
                ההודעה או את תשובת האבטחה. רק מי שיודע את התשובה הנכונה יכול
                לפענח את המסר — אנחנו לא יכולים ואף אחד אחר לא יכול.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
              <Lock className="size-4 shrink-0" aria-hidden />
              <span>הצפנה מקצה לקצה • ללא שמירת תוכן רגיש בשרת</span>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
