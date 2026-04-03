"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArticleCard } from "./ArticleCard";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { getArticles, type PublicArticle } from "@/app/(marketing)/articles/actions";
import { InfiniteScrollTrigger } from "@/components/ui/infinite-scroll-trigger";

interface ArticleListProps {
  initialData: PublicArticle[];
  initialHasMore: boolean;
}

const LIMIT = 10;

function ArticleListItem({ article }: { article: PublicArticle }) {
  const plain =
    article.content?.replace(/<[^>]*>/g, "").slice(0, 200) ?? "";
  const excerpt = article.content && (
    <p className="text-right text-sm text-muted-foreground line-clamp-3">
      {plain}
      {(article.content?.replace(/<[^>]*>/g, "") ?? "").length > 200
        ? "..."
        : ""}
    </p>
  );

  if (article.media_type === "link") {
    return (
      <Card className="group border-border bg-card hover:border-teal-200 hover:shadow-md dark:hover:border-teal-800 transition-all duration-200 overflow-hidden h-full flex flex-col">
        <a
          href={article.media_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-t-xl"
          aria-label={`פתיחת קישור חיצוני: ${article.title}`}
        >
          <ArticleCard
            title={article.title}
            mediaType="link"
            mediaUrl={article.media_url}
            linkThumbnail={article.link_thumbnail}
            imageAlt={article.title}
            className="rounded-t-xl rounded-b-none"
          />
        </a>
        <Link
          href={`/articles/${article.id}`}
          className="flex flex-1 flex-col text-inherit hover:no-underline min-h-0"
        >
          <CardHeader>
            <CardTitle className="text-right text-lg group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
              {article.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">{excerpt}</CardContent>
        </Link>
      </Card>
    );
  }

  return (
    <Link href={`/articles/${article.id}`}>
      <Card className="group border-border bg-card hover:border-teal-200 hover:shadow-md dark:hover:border-teal-800 transition-all duration-200 overflow-hidden h-full">
        <ArticleCard
          title={article.title}
          mediaType={article.media_type}
          mediaUrl={article.media_url}
          linkThumbnail={article.link_thumbnail}
          imageAlt={article.title}
          className="rounded-t-xl rounded-b-none"
        />
        <CardHeader>
          <CardTitle className="text-right text-lg">{article.title}</CardTitle>
        </CardHeader>
        <CardContent>{excerpt}</CardContent>
      </Card>
    </Link>
  );
}

export function ArticleList({ initialData, initialHasMore }: ArticleListProps) {
  const { items, loadMore, hasMore, isLoading } = useInfiniteScroll({
    initialData,
    initialHasMore,
    fetchAction: getArticles,
    limit: LIMIT,
  });

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((article) => (
          <div
            key={article.id}
            className="animate-in fade-in duration-300 ease-out"
          >
            <ArticleListItem article={article} />
          </div>
        ))}
      </div>
      <InfiniteScrollTrigger
        onLoadMore={loadMore}
        hasMore={hasMore}
        isLoading={isLoading}
        showEndMessage={items.length > 0}
        endMessage="סוף הרשימה"
      />
    </>
  );
}
