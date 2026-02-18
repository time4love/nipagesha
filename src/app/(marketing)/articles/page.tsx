import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { getPublishedArticles } from "@/lib/articles";

export const metadata = {
  title: "מאמרים | מידע וכלים להתמודדות | ניפגשה",
  description:
    "מאמרים על ניכור הורי, היבטים משפטיים ותמיכה נפשית. כלים להבנה ולהתמודדות.",
};

export default async function ArticlesPage() {
  const articles = await getPublishedArticles();

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
          {articles.length === 0 ? (
            <p className="text-center text-muted-foreground">
              אין מאמרים לפרסום כרגע.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <Link key={article.id} href={`/articles/${article.id}`}>
                  <Card className="group border-border bg-card hover:border-teal-200 hover:shadow-md dark:hover:border-teal-800 transition-all duration-200 overflow-hidden h-full">
                    <ArticleCard
                      title={article.title}
                      mediaType={article.media_type}
                      mediaUrl={article.media_url}
                      imageAlt={article.title}
                      className="rounded-t-xl rounded-b-none"
                    />
                    <CardHeader>
                      <CardTitle className="text-right text-lg">
                        {article.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {article.content && (() => {
                        const plain = article.content.replace(/<[^>]*>/g, "");
                        return (
                          <p className="text-right text-sm text-muted-foreground line-clamp-3">
                            {plain.slice(0, 200)}
                            {plain.length > 200 ? "..." : ""}
                          </p>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
