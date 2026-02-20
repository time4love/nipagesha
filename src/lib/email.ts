/**
 * Email sending via Resend. No-op if RESEND_API_KEY is not set (e.g. local dev).
 * Configure RESEND_API_KEY and optionally RESEND_FROM in .env.local.
 */

import { Resend } from "resend";
import { RESEND_API_KEY } from "@/lib/config";

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const DEFAULT_FROM =
  process.env.RESEND_FROM ?? "לוח עזרה <onboarding@resend.dev>";

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
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
}: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    if (process.env.NODE_ENV === "development") {
      console.info("[email] RESEND_API_KEY not set; skipping send.", { to, subject });
    }
    return { success: false, error: "Email not configured" };
  }
  try {
    const { error } = await resend.emails.send({ from, to, subject, html });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}
