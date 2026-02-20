import { getSongs } from "./actions";
import { SongList } from "@/components/songs/SongList";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageCircle, Music } from "lucide-react";

export const metadata = {
  title: "שירי הורים | ניפגשה",
  description:
    "שירים ומוזיקה שנכתבו עבור הורים שמחפשים לחדש את הקשר עם ילדיהם. המוזיקה מרפאה ומחברת.",
};

const INITIAL_LIMIT = 10;

export default async function SongsPage() {
  const { data: initialData, hasMore: initialHasMore } = await getSongs(
    0,
    INITIAL_LIMIT
  );

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Hero */}
      <section
        className="relative overflow-hidden px-4 py-16 sm:py-20 md:py-24"
        aria-labelledby="songs-hero-heading"
      >
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-b from-amber-50/70 via-orange-50/40 to-background dark:from-amber-950/20 dark:via-orange-950/10 dark:to-background"
          aria-hidden
        />
        <div className="container mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 p-3 mb-4">
            <Music className="size-8 text-amber-600 dark:text-amber-400" aria-hidden />
          </div>
          <h1
            id="songs-hero-heading"
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl"
          >
            שירי הורים
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            שירים ומוזיקה שנכתבו מתוך הלב, עבור הורים שהקשר עם ילדיהם נותק.
            המוזיקה נושאת תפילה ותקווה — ומרפאת.
          </p>
        </div>
      </section>

      {/* Song grid */}
      <section className="container mx-auto px-4 py-8 sm:py-12">
        {initialData.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-12">
            <p className="text-muted-foreground">
              עדיין לא הועלו שירים. בקרוב יופיעו כאן שירים וקליפים.
            </p>
          </div>
        ) : (
          <SongList
            initialData={initialData}
            initialHasMore={initialHasMore}
          />
        )}
      </section>

      {/* CTA */}
      <section
        className="border-t bg-muted/30 px-4 py-14 sm:py-18"
        aria-labelledby="songs-cta-heading"
      >
        <div className="container mx-auto max-w-2xl">
          <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-b from-amber-50/50 to-card dark:from-amber-950/20 dark:to-card text-center sm:text-right">
            <CardHeader>
              <div className="mx-auto sm:mr-0 flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400 mb-2">
                <MessageCircle className="size-6" aria-hidden />
              </div>
              <CardTitle id="songs-cta-heading" className="text-xl sm:text-2xl">
                רוצים שנכתוב שיר עבורכם?
              </CardTitle>
              <CardDescription className="text-base">
                נשמח ליצור עבורכם שיר אישי. צרו איתנו קשר ונחזור אליכם.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                size="lg"
                className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
              >
                <Link href="/#cta-heading" className="inline-flex items-center gap-2">
                  <MessageCircle className="size-4" aria-hidden />
                  צרו קשר
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
