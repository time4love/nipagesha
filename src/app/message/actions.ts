"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
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
