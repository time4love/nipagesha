import { ArticleList } from "@/components/articles/ArticleList";
import { getPublishedArticles } from "@/lib/articles";

export const metadata = {
  title: "מאמרים | מידע וכלים להתמודדות | ניפגשה",
  description:
    "מאמרים על ניכור הורי, היבטים משפטיים ותמיכה נפשית. כלים להבנה ולהתמודדות.",
};

const INITIAL_LIMIT = 10;

export default async function ArticlesPage() {
  const { data: initialData, hasMore: initialHasMore } =
    await getPublishedArticles(0, INITIAL_LIMIT);

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
          {initialData.length === 0 ? (
            <p className="text-center text-muted-foreground">
              אין מאמרים לפרסום כרגע.
            </p>
          ) : (
            <ArticleList
              initialData={initialData}
              initialHasMore={initialHasMore}
            />
          )}
        </section>
      </div>
    </div>
  );
}
