import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublishedArticleById } from "@/lib/articles";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { ArticleContent } from "@/components/articles/ArticleContent";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getPublishedArticleById(id);
  if (!article) return { title: "מאמר | ניפגשה" };
  return {
    title: `${article.title} | מאמרים | ניפגשה`,
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
            חזרה למאמרים
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

          <ArticleCard
            title={article.title}
            mediaType={article.media_type}
            mediaUrl={article.media_url}
            imageAlt={article.title}
            className="rounded-xl overflow-hidden"
          />

          {article.content && (
            <ArticleContent html={article.content} className="mt-8" />
          )}
        </article>
      </div>
    </div>
  );
}
