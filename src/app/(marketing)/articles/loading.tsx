import { Skeleton } from "@/components/ui/skeleton";

export default function ArticlesLoading() {
  return (
    <div className="min-h-screen" dir="rtl">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <Skeleton className="h-10 w-3/4 max-w-xl mx-auto" />
            <Skeleton className="h-5 w-full max-w-lg mx-auto" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl sm:col-span-2" />
          </div>
        </div>
      </div>
    </div>
  );
}
