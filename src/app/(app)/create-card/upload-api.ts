/**
 * Client helper: upload image to secure-media via API and return storage path.
 */
export async function uploadImageViaApi(
  file: File
): Promise<{ path: string; error?: string }> {
  const formData = new FormData();
  formData.set("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { path: "", error: data.error ?? "Upload failed" };
  }
  return { path: data.path ?? "" };
}

/**
 * Client helper: upload image to public-media via API and return public URL.
 * Use for article content and other public rich text.
 */
export async function uploadPublicImageViaApi(
  file: File
): Promise<{ url: string; error?: string }> {
  const formData = new FormData();
  formData.set("file", file);
  formData.set("mode", "public");
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { url: "", error: data.error ?? "Upload failed" };
  }
  return { url: data.url ?? "" };
}
