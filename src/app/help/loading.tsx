import { Skeleton } from "@/components/ui/skeleton";

export default function HelpLoading() {
  return (
    <section className="space-y-8 px-4 py-8" dir="rtl">
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-72 max-w-full" />
      </div>
      <Skeleton className="h-10 w-full max-w-[280px] rounded-md" />
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-end">
        <Skeleton className="h-10 w-full max-w-xs" />
        <Skeleton className="h-10 w-full max-w-[180px] md:w-[180px]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    </section>
  );
}
