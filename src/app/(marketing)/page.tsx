import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Music, BookOpen } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen" dir="rtl">
      {/* Section 1: Hero - מחברים מחדש את הקשר */}
      <section
        className="relative overflow-hidden px-4 py-20 sm:py-28 md:py-36"
        aria-labelledby="hero-heading"
      >
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-b from-teal-50/80 via-sky-50/50 to-background"
          aria-hidden
        />
        <div className="container mx-auto max-w-4xl text-center">
          <h1
            id="hero-heading"
            className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl"
          >
            מחברים מחדש את הקשר
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground sm:text-xl">
            ניפגשה מאפשרת להורים שהקשר עם ילדיהם נותק להשאיר מסר מאובטח ופרטי.
            רק הילד יוכל לפתוח אותו — באמצעות תשובה לסוד שרק הוא מכיר.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-4">
            <Button
              asChild
              size="lg"
              className="bg-teal-600 hover:bg-teal-700 text-white shadow-md"
            >
              <Link href="/dashboard">אני הורה</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-white border-teal-200 text-teal-600 hover:bg-teal-50 hover:text-teal-700"
            >
              <Link href="/search">אני מחפש מסר</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Section 2: Songs of Connection (Video) */}
      <section
        className="relative min-h-[28rem] sm:min-h-[32rem] md:min-h-[36rem] flex items-center justify-center overflow-hidden bg-gradient-to-b from-amber-950/90 to-slate-950"
        aria-labelledby="songs-section-heading"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="object-cover w-full h-full absolute inset-0 z-0"
          aria-hidden
        >
          <source src="/videos/songs-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 z-[1] bg-black/50" aria-hidden />
        <div className="relative z-10 container mx-auto px-4 py-16 text-center">
          <h2
            id="songs-section-heading"
            className="text-3xl font-bold text-white drop-shadow-md sm:text-4xl md:text-5xl"
          >
            קולות של געגוע
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-lg text-white/90 drop-shadow">
            שירים שנכתבו במיוחד על ידי הורים לילדיהם. להקשיב, להתרגש, להתחבר.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 bg-white/20 hover:bg-white/30 text-white border border-white/40 backdrop-blur gap-2"
          >
            <Link href="/songs">
              <Music className="size-4" aria-hidden />
              למתחם השירים
            </Link>
          </Button>
        </div>
      </section>

      {/* Section 3: מהו ניכור הורי? + link to articles */}
      <section
        className="border-t bg-muted/20 px-4 py-16 sm:py-20"
        aria-labelledby="alienation-heading"
      >
        <div className="container mx-auto max-w-3xl">
          <h2
            id="alienation-heading"
            className="text-3xl font-bold text-foreground sm:text-4xl text-right"
          >
            מהו ניכור הורי?
          </h2>
          <p className="mt-6 text-foreground/90 leading-relaxed text-right">
            ניכור הורי הוא מצב בו אחד ההורים (ההורה המנכר) פועל באופן פעיל ולעיתים מתמשך כדי לנתק את הקשר הרגשי, הפיזי והתקשורתי של הילד עם ההורה השני (ההורה המנוכר). זהו תהליך של שטיפת מוח, הסתה רגשית ונפשית, ולעיתים גם יצירת מצגי שווא של סכנה או &quot;אמת&quot; מדומה, שנועדו לגרום לילד להאמין שההורה השני מסוכן, רע, פגום או לא רלוונטי.
          </p>
          <h3 className="mt-8 text-xl font-semibold text-foreground text-right">
            סימנים בולטים לניכור הורי:
          </h3>
          <ul className="mt-3 list-disc list-inside text-foreground/90 leading-relaxed text-right space-y-2">
            <li>הילד מסרב לראות או לדבר עם אחד ההורים ללא סיבה הגיונית.</li>
            <li>הילד משמיע טענות &quot;בוגרות מדי&quot; או מדקלם מילים שאינן תואמות את גילו.</li>
            <li>הילד חוזר על טענות של ההורה המשמורן בלי שברור שהוא חווה אותן בעצמו.</li>
            <li>הילד לא מרגיש רגשות אשמה על הניתוק מההורה המנוכר.</li>
          </ul>
          <h3 className="mt-8 text-xl font-semibold text-foreground text-right">
            חשוב להבין:
          </h3>
          <p className="mt-3 text-foreground/90 leading-relaxed text-right">
            ניכור הורי הוא פגיעה נפשית בילד. הילד הופך לכלי במאבק רגשי או משפטי, מאבד דמות הורית אחת, ולרוב גם את האמון במבוגרים בכלל. זהו סוג של התעללות רגשית, גם אם היא נעשית מתוך רצון &quot;להגן על הילד&quot; כביכול.
          </p>
          <div className="mt-10 text-right">
            <Button asChild variant="outline" size="lg" className="gap-2 bg-white border-teal-200 text-teal-600 hover:bg-teal-50 hover:text-teal-700">
              <Link href="/articles">
                <BookOpen className="size-4" aria-hidden />
                למתחם המאמרים
                <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Soft CTA strip */}
      <section
        className="border-t bg-muted/20 px-4 py-12"
        aria-labelledby="cta-heading"
      >
        <div className="container mx-auto max-w-2xl text-center">
          <h2 id="cta-heading" className="text-xl font-semibold text-foreground">
            מוכנים להתחיל?
          </h2>
          <p className="mt-2 text-muted-foreground">
            בין אם אתם הורה שמחפש לשלוח מסר או מישהו שמחפש מסר — אנחנו כאן.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white">
              <Link href="/dashboard">אני הורה</Link>
            </Button>
            <Button asChild variant="outline" className="bg-white border-teal-200 text-teal-600 hover:bg-teal-50 hover:text-teal-700">
              <Link href="/search">אני מחפש מסר</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
