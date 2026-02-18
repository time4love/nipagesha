"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { ACCESS_LOG_SALT } from "@/lib/config";
import { createHmac } from "crypto";

const ATTEMPT_SUCCESS = "success";
const ATTEMPT_FAILURE = "failure";

/**
 * Returns anonymized IP: HMAC-SHA256 hash. Never store or log raw IP.
 */
/** Returns HMAC-SHA256 hash of IP; never store raw IP. */
function anonymizeIp(ip: string, salt: string): string {
  const value = (ip || "unknown").trim() || "unknown";
  return createHmac("sha256", salt || "log-salt").update(value).digest("hex");
}

function getClientIp(headersList: Headers): string {
  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = headersList.get("x-real-ip");
  if (real) return real.trim();
  return "";
}

/**
 * Logs an access attempt (success or failure) for a card. Stores only anonymized IP (hash).
 * On success, marks the card as read.
 */
export async function logAccessAttempt(
  cardId: string,
  success: boolean
): Promise<{ error?: string }> {
  const headersList = await headers();
  const ip = getClientIp(headersList);
  const salt = ACCESS_LOG_SALT;
  const anonymizedIp = anonymizeIp(ip, salt);

  const attemptType = success ? ATTEMPT_SUCCESS : ATTEMPT_FAILURE;

  const supabase = await createClient();
  const { error: insertError } = await supabase.from("card_access_logs").insert({
    card_id: cardId,
    attempt_type: attemptType,
    anonymized_ip: anonymizedIp,
  });

  if (insertError) {
    return { error: insertError.message };
  }

  if (success) {
    try {
      const admin = createAdminClient();
      await admin.from("child_cards").update({ is_read: true }).eq("id", cardId);
    } catch {
      // Log already saved; is_read update is best-effort (e.g. missing service role in dev).
    }
  }

  return {};
}

/**
 * Sends a reply from the child (anonymous) to the parent after decrypting the card.
 * Looks up parent_id from child_cards, then inserts into child_replies.
 */
export async function sendReply(
  cardId: string,
  content: string,
  contactInfo?: string
): Promise<{ error?: string }> {
  const trimmed = (content ?? "").trim();
  if (!trimmed) {
    return { error: "תוכן ההודעה חובה" };
  }

  const admin = createAdminClient();
  const { data: card, error: fetchError } = await admin
    .from("child_cards")
    .select("user_id")
    .eq("id", cardId)
    .single();

  if (fetchError || !card?.user_id) {
    return { error: "כרטיס לא נמצא" };
  }

  const { error: insertError } = await admin.from("child_replies").insert({
    card_id: cardId,
    parent_id: card.user_id,
    content: trimmed,
    contact_info: (contactInfo ?? "").trim() || null,
  });

  if (insertError) {
    return { error: insertError.message };
  }

  return {};
}

/**
 * Marks a single child reply as read. Caller must be the parent (RLS enforced).
 */
export async function markReplyAsRead(replyId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("child_replies")
    .update({ is_read: true })
    .eq("id", replyId);

  if (error) return { error: error.message };
  return {};
}

/**
 * Marks all child replies for a card as read. Caller must be the parent (RLS enforced).
 */
export async function markAllRepliesAsReadForCard(
  cardId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("child_replies")
    .update({ is_read: true })
    .eq("card_id", cardId);

  if (error) return { error: error.message };
  return {};
}

const BUCKET_SECURE_MEDIA = "secure-media";
const SIGNED_URL_EXPIRY_SECONDS = 3600;

export type GetSignedUrlsForCardResult =
  | { success: true; urls: Record<string, string> }
  | { success: false; error: string };

/**
 * Returns signed URLs for card images when the viewer is unauthenticated (child).
 * Only paths under the card owner's storage folder are allowed.
 * Uses admin client so it works without user session.
 */
export async function getSignedUrlsForCard(
  cardId: string,
  filePaths: string[]
): Promise<GetSignedUrlsForCardResult> {
  if (!filePaths?.length) return { success: true, urls: {} };

  try {
    const { data: card, error: cardError } = await adminClient
      .from("child_cards")
      .select("user_id")
      .eq("id", cardId)
      .single();

    if (cardError || !card?.user_id) {
      return { success: false, error: "Card not found" };
    }

    const prefix = `${card.user_id}/`;
    const allowedPaths = filePaths.filter((p) => p.startsWith(prefix));
    const signedUrls: Record<string, string> = {};

    for (const path of allowedPaths) {
      const cleanPath = path.replace(/^private:\/\//, "");
      const { data, error } = await adminClient.storage
        .from(BUCKET_SECURE_MEDIA)
        .createSignedUrl(cleanPath, SIGNED_URL_EXPIRY_SECONDS);

      if (error) {
        console.error(`Failed to sign url for ${cleanPath}:`, error.message);
        continue;
      }
      if (data?.signedUrl) {
        signedUrls[path] = data.signedUrl;
      }
    }

    return { success: true, urls: signedUrls };
  } catch (err) {
    console.error("getSignedUrlsForCard error:", err);
    return { success: false, error: "Failed to generate URLs" };
  }
}
