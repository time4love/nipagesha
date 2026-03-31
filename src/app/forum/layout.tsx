export default function ForumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">{children}</main>
    </div>
  );
}
