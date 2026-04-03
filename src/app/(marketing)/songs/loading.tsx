import { Skeleton } from "@/components/ui/skeleton";

export default function SongsLoading() {
  return (
    <div className="min-h-screen" dir="rtl">
      <section className="px-4 py-16 sm:py-20">
        <div className="container mx-auto max-w-3xl text-center space-y-4">
          <Skeleton className="h-14 w-14 rounded-full mx-auto" />
          <Skeleton className="h-12 w-2/3 max-w-md mx-auto" />
          <Skeleton className="h-5 w-full max-w-xl mx-auto" />
        </div>
      </section>
      <div className="container mx-auto px-4 pb-16 space-y-4">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}
