/**
 * Admin authorization. Application-level check only.
 * RLS allows all authenticated users; this restricts admin actions to listed emails.
 *
 * Default admin is always included. Set ADMIN_EMAILS in .env (comma-separated) to add more, e.g.:
 * ADMIN_EMAILS=other@example.com
 */

const DEFAULT_ADMIN_EMAILS = ["jodagm@gmail.com"] as const;

function getAdminEmails(): string[] {
  const defaults = (DEFAULT_ADMIN_EMAILS as readonly string[]).map((e) => e.toLowerCase());
  const env = process.env.ADMIN_EMAILS;
  if (env && typeof env === "string") {
    const fromEnv = env
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    return [...new Set([...defaults, ...fromEnv])];
  }
  return defaults;
}

export function isAdmin(userEmail: string | undefined): boolean {
  if (!userEmail || typeof userEmail !== "string") return false;
  const normalized = userEmail.trim().toLowerCase();
  return getAdminEmails().includes(normalized);
}

/** First admin email for notifications (e.g. new contact submission). */
export function getAdminNotificationEmail(): string | undefined {
  const emails = getAdminEmails();
  return emails[0];
}
