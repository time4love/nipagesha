"use client";

/**
 * Facebook Page Plugin iframe for a public post URL.
 * @see https://developers.facebook.com/docs/plugins/embedded-posts
 */
export function FacebookEmbed({ url }: { url: string | null | undefined }) {
  if (!url?.trim()) return null;

  const encodedUrl = encodeURIComponent(url.trim());
  const iframeSrc = `https://www.facebook.com/plugins/post.php?href=${encodedUrl}&show_text=true&width=500`;

  return (
    <div className="my-4 flex w-full justify-center overflow-hidden rounded-lg">
      <iframe
        src={iframeSrc}
        width={500}
        height={600}
        title="תצוגת פוסט פייסבוק"
        className="max-h-[min(600px,70vh)] max-w-full border-0"
        style={{ overflow: "hidden" }}
        scrolling="no"
        allowFullScreen
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
      />
    </div>
  );
}
