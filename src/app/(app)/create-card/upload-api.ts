/**
 * Client helper: upload image to secure-media via API and return storage path.
 */
export async function uploadImageViaApi(file: File): Promise<{ path: string; error?: string }> {
  const formData = new FormData();
  formData.set("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { path: "", error: data.error ?? "Upload failed" };
  }
  return { path: data.path ?? "" };
}
