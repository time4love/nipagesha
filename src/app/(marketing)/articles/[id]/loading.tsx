import { Skeleton } from "@/components/ui/skeleton";

export default function ArticleDetailLoading() {
  return (
    <div className="min-h-screen" dir="rtl">
      <div className="container mx-auto px-4 py-12 max-w-3xl space-y-6">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-10 w-full max-w-2xl" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="aspect-video w-full rounded-lg" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}
