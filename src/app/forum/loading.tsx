import { Skeleton } from "@/components/ui/skeleton";

export default function ForumLoading() {
  return (
    <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8" dir="rtl">
      <div className="space-y-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-5 w-64 max-w-full" />
      </div>
      <Skeleton className="h-10 w-full max-w-sm" />
      <div className="space-y-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    </div>
  );
}
