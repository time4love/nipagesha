/**
 * Supabase Storage helper. Upload to the private bucket "secure-media".
 * Bucket must be created in Supabase Dashboard and set to Private.
 */

import { createClient } from "./server";

const BUCKET_SECURE_MEDIA = "secure-media";
const DEFAULT_OPTIONS: { upsert?: boolean } = { upsert: true };

export interface UploadResult {
  path: string;
  error?: string;
}

/**
 * Uploads a file to the secure-media bucket. Returns the storage path (not a public URL).
 * Use this path with private://[path] in rich text; resolve to signed URL when displaying.
 */
export async function uploadToSecureMedia(
  file: File,
  options?: { folder?: string }
): Promise<UploadResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) {
    return { path: "", error: "Unauthorized" };
  }

  const ext = file.name.split(".").pop() ?? "bin";
  const name = `${crypto.randomUUID()}.${ext}`;
  const path = options?.folder ? `${options.folder}/${name}` : name;
  // Optionally scope by user so RLS can restrict access
  const scopedPath = `${user.id}/${path}`;

  const { error } = await supabase.storage
    .from(BUCKET_SECURE_MEDIA)
    .upload(scopedPath, file, { ...DEFAULT_OPTIONS, contentType: file.type });

  if (error) {
    return { path: "", error: error.message };
  }
  return { path: scopedPath };
}

const SIGNED_URL_EXPIRY_SECONDS = 3600; // 1 hour

/**
 * Returns a temporary signed URL for a file in secure-media (e.g. for MessageRenderer).
 * Bucket must allow the authenticated user to read (RLS policy).
 */
export async function getSignedUrl(
  path: string
): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { signedUrl },
    error,
  } = await supabase.storage
    .from(BUCKET_SECURE_MEDIA)
    .createSignedUrl(path, SIGNED_URL_EXPIRY_SECONDS);

  if (error) {
    return { error: error.message };
  }
  return { url: signedUrl ?? undefined };
}
