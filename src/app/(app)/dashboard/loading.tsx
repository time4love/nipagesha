import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <section className="space-y-10" dir="rtl">
      <Skeleton className="h-10 w-48" />
      <div className="space-y-4">
        <Skeleton className="h-7 w-56" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-36 w-full max-w-2xl rounded-xl" />
      </div>
    </section>
  );
}
