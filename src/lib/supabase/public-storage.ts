/**
 * Public media storage. Uploads to the "public-media" bucket.
 * Use for article images and other public assets (SEO-friendly).
 * Bucket must be created in Supabase Dashboard and set to Public.
 */

import { createClient } from "./server";

const BUCKET_PUBLIC_MEDIA = "public-media";
const DEFAULT_OPTIONS = { upsert: true };

/**
 * Uploads a file to the public-media bucket and returns its public URL.
 * Call from server only (e.g. server action).
 */
export async function uploadPublicFile(
  file: File,
  folder: string
): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) {
    return { error: "Unauthorized" };
  }

  const ext = file.name.split(".").pop() ?? "bin";
  const name = `${crypto.randomUUID()}.${ext}`;
  const path = `${folder}/${name}`;

  const { error } = await supabase.storage
    .from(BUCKET_PUBLIC_MEDIA)
    .upload(path, file, { ...DEFAULT_OPTIONS, contentType: file.type });

  if (error) {
    return { error: error.message };
  }

  const { data } = supabase.storage.from(BUCKET_PUBLIC_MEDIA).getPublicUrl(path);
  return { url: data.publicUrl };
}
