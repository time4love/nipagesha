import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublishedArticleById } from "@/lib/articles";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { ArticleContent } from "@/components/articles/ArticleContent";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink } from "lucide-react";

/** ISR: article pages can be cached and revalidated hourly. */
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getPublishedArticleById(id);
  if (!article) return { title: "מידע | ניפגשה" };
  return {
    title: `${article.title} | מידע | ניפגשה`,
    description:
      article.content?.replace(/<[^>]*>/g, "").slice(0, 160) ?? article.title,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getPublishedArticleById(id);
  if (!article) notFound();

  return (
    <div className="min-h-screen" dir="rtl">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Button variant="ghost" size="sm" asChild className="mb-6 -mr-2">
          <Link href="/articles" className="inline-flex items-center gap-2">
            <ArrowRight className="size-4" aria-hidden />
            חזרה למידע
          </Link>
        </Button>

        <article className="space-y-8">
          <header>
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
              {article.title}
            </h1>
            <time
              dateTime={article.created_at}
              className="mt-2 block text-sm text-muted-foreground"
            >
              {new Date(article.created_at).toLocaleDateString("he-IL", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </header>

          {article.media_type === "link" ? (
            <section
              className="rounded-xl border border-teal-200/90 bg-gradient-to-br from-teal-50/95 via-card to-card p-6 text-center shadow-sm dark:border-teal-900/50 dark:from-teal-950/40 dark:via-card dark:to-card"
              aria-labelledby="article-external-cta"
              dir="rtl"
            >
              <h2
                id="article-external-cta"
                className="text-lg font-semibold text-foreground sm:text-xl"
              >
                לצפייה בכתבה המלאה / סרטון המקור
              </h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                התוכן נפתח באתר המקור — לחצו להמשך צפייה או קריאה.
              </p>
              <Button
                asChild
                size="lg"
                className="mt-5 bg-teal-600 hover:bg-teal-700 text-white gap-2"
              >
                <a
                  href={article.media_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="size-4 shrink-0" aria-hidden />
                  מעבר לאתר החיצוני
                </a>
              </Button>
            </section>
          ) : (
            <ArticleCard
              title={article.title}
              mediaType={article.media_type}
              mediaUrl={article.media_url}
              linkThumbnail={article.link_thumbnail}
              imageAlt={article.title}
              className="rounded-xl overflow-hidden"
            />
          )}

          {article.content && (
            <ArticleContent html={article.content} className="mt-8" />
          )}
        </article>
      </div>
    </div>
  );
}
