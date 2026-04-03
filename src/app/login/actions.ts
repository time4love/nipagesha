"use server";

import { getAdminEmails } from "@/lib/admin";
import { sendEmail } from "@/lib/email";

function escapeHtmlForEmail(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rtlEmailWrap(innerHtml: string): string {
  return `<div dir="rtl" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px;">${innerHtml}</div>`;
}

/**
 * Notifies admins when a new user registers (email/password).
 * Never throws — failures are logged only so signup UX is never blocked.
 */
export async function notifyAdminOnNewUser(newUserEmail: string): Promise<void> {
  try {
    const trimmed = newUserEmail?.trim();
    if (!trimmed) return;

    const admins = getAdminEmails();
    if (admins.length === 0) return;

    const safe = escapeHtmlForEmail(trimmed);
    const subject = "[ניפגשה] 🎉 משתמש חדש נרשם לאתר!";
    const html = rtlEmailWrap(`
      <p style="margin:0 0 16px; line-height:1.6; font-size:15px; color:#111;">
        משתמש חדש הצטרף לקהילה. כתובת האימייל שלו: <strong>${safe}</strong>
      </p>
      <p style="margin:0; font-size:13px; color:#666;">
        הודעה אוטומטית ממערכת ניפגשה
      </p>
    `);

    const result = await sendEmail({ to: admins, subject, html });
    if (!result.success) {
      console.error("[notifyAdminOnNewUser] Email send failed:", result.error ?? "unknown");
    }
  } catch (err) {
    console.error("[notifyAdminOnNewUser]", err);
  }
}
