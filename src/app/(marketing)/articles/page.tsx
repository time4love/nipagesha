import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Scale, Heart } from "lucide-react";

const articles = [
  {
    title: "מהו ניכור הורי?",
    icon: BookOpen,
    description: "הבנת התופעה, הסימנים וההשלכות על הילד וההורה.",
  },
  {
    title: "היבטים משפטיים",
    icon: Scale,
    description: "זכויות, נהלים ודרכי פעולה בבתי המשפט.",
  },
  {
    title: "תמיכה נפשית",
    icon: Heart,
    description: "כיצד לשמור על החוסן הנפשי בתקופה מורכבת זו.",
  },
];

export const metadata = {
  title: "מאמרים | מידע וכלים להתמודדות | ניפגשה",
  description:
    "מאמרים על ניכור הורי, היבטים משפטיים ותמיכה נפשית. כלים להבנה ולהתמודדות.",
};

export default function ArticlesPage() {
  return (
    <div className="min-h-screen" dir="rtl">
      <div className="container mx-auto px-4 py-16">
        <section className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
              מידע וכלים להתמודדות
            </h1>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              מאמרים וכלים שיעזרו לכם להבין, להתמודד ולפעול.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => {
              const Icon = article.icon;
              return (
                <Card
                  key={article.title}
                  className="group border-border bg-card hover:border-teal-200 hover:shadow-md dark:hover:border-teal-800 transition-all duration-200"
                >
                  <CardHeader>
                    <div className="flex size-11 items-center justify-center rounded-lg bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400 mb-1">
                      <Icon className="size-5" aria-hidden />
                    </div>
                    <CardTitle className="text-right text-lg">
                      {article.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-right">
                      {article.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <p className="mt-8 text-center text-muted-foreground text-sm">
            תוכן מפורט לכל נושא יופיע כאן בהמשך.
          </p>
        </section>
      </div>
    </div>
  );
}
