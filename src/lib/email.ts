/**
 * Email sending via Resend. No-op if RESEND_API_KEY is not set (e.g. local dev).
 * All emails are sent FROM our verified domain (nipagesha.co.il). Use replyTo for user replies.
 * Configure RESEND_API_KEY and optionally RESEND_FROM in .env.local (must use @nipagesha.co.il).
 */

import { Resend } from "resend";
import { RESEND_API_KEY } from "@/lib/config";

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

/** Default sender: verified domain only. Override with RESEND_FROM (e.g. "ניפגשה <no-reply@nipagesha.co.il>"). */
const DEFAULT_FROM =
  process.env.RESEND_FROM ?? "ניפגשה <no-reply@nipagesha.co.il>";

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  /** Sender address; must be @nipagesha.co.il. Defaults to DEFAULT_FROM. */
  from?: string;
  /** Reply-To header when recipient should reply to a user (e.g. contact form submitter). */
  replyTo?: string;
}

/**
 * Sends an email. Returns { success: true } or { success: false, error }.
 * If RESEND_API_KEY is not set, logs and returns success false (no throw).
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = DEFAULT_FROM,
  replyTo,
}: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    if (process.env.NODE_ENV === "development") {
      console.info("[email] RESEND_API_KEY not set; skipping send.", { to, subject });
    }
    return { success: false, error: "Email not configured" };
  }
  try {
    const payload: Parameters<Resend["emails"]["send"]>[0] = { from, to, subject, html };
    if (replyTo) payload.replyTo = replyTo;
    const { error } = await resend.emails.send(payload);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}
