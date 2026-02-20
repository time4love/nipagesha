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
  return (
    <Link href={`/articles/${article.id}`}>
      <Card className="group border-border bg-card hover:border-teal-200 hover:shadow-md dark:hover:border-teal-800 transition-all duration-200 overflow-hidden h-full">
        <ArticleCard
          title={article.title}
          mediaType={article.media_type}
          mediaUrl={article.media_url}
          imageAlt={article.title}
          className="rounded-t-xl rounded-b-none"
        />
        <CardHeader>
          <CardTitle className="text-right text-lg">{article.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {article.content && (
            <p className="text-right text-sm text-muted-foreground line-clamp-3">
              {plain}
              {(article.content?.replace(/<[^>]*>/g, "") ?? "").length > 200
                ? "..."
                : ""}
            </p>
          )}
        </CardContent>
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
