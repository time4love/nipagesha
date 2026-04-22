export default function SongLoading() {
  return (
    <div className="min-h-screen" dir="rtl" aria-busy>
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-3xl space-y-6">
        <div className="h-8 w-40 rounded-md bg-muted animate-pulse" />
        <div className="h-10 w-3/4 max-w-md rounded-md bg-muted animate-pulse" />
        <div className="aspect-video w-full rounded-xl bg-muted animate-pulse" />
        <div className="h-48 w-full rounded-xl bg-muted/80 animate-pulse" />
      </div>
    </div>
  );
}
