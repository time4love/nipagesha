import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getPublishedArticleById,
  getArticleOpenGraphImageUrl,
} from "@/lib/articles";
import { stripHtmlToSnippet } from "@/lib/forum";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { ArticleContent } from "@/components/articles/ArticleContent";
import { ShareButton } from "@/components/common/ShareButton";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink } from "lucide-react";

/** ISR: article pages can be cached and revalidated hourly. */
export const revalidate = 3600;

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.nipagesha.co.il";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const article = await getPublishedArticleById(id);
  if (!article) {
    return { title: "מידע | ניפגשה" };
  }

  const description = article.content?.trim()
    ? stripHtmlToSnippet(article.content, 150)
    : article.title;

  const ogImage = getArticleOpenGraphImageUrl(article, SITE_ORIGIN);
  const pageUrl = `${SITE_ORIGIN}/articles/${id}`;

  return {
    title: `${article.title} | ניפגשה`,
    description,
    openGraph: {
      title: article.title,
      description,
      url: pageUrl,
      type: "article",
      locale: "he_IL",
      siteName: "ניפגשה",
      images: [{ url: ogImage, alt: article.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: [ogImage],
    },
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

  const shareUrl = `${SITE_ORIGIN}/articles/${id}`;
  const shareText =
    article.content && article.content.trim()
      ? stripHtmlToSnippet(article.content, 160)
      : article.title;

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
          <header className="space-y-4">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl leading-tight">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <time
                dateTime={article.created_at}
                className="text-sm text-muted-foreground tabular-nums"
              >
                {new Date(article.created_at).toLocaleDateString("he-IL", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <ShareButton
                title={article.title}
                text={shareText}
                url={shareUrl}
                variant="outline"
                size="sm"
                className="shrink-0 border-border/80 text-muted-foreground hover:text-foreground"
              />
            </div>
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

          {article.content ? (
            <ArticleContent html={article.content} className="mt-8" />
          ) : null}

          <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-border/80 pt-6">
            <ShareButton
              title={article.title}
              text={shareText}
              url={shareUrl}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            />
          </footer>
        </article>
      </div>
    </div>
  );
}
