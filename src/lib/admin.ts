/**
 * Admin authorization. Application-level check only.
 * RLS allows all authenticated users; this restricts admin actions to listed emails.
 *
 * Set ADMIN_EMAILS in .env.local (comma-separated) to override, e.g.:
 * ADMIN_EMAILS=you@example.com,other@example.com
 */

const DEFAULT_ADMIN_EMAILS = ["jodagm@gmail.com"] as const;

function getAdminEmails(): string[] {
  const env = process.env.ADMIN_EMAILS;
  if (env && typeof env === "string") {
    return env.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  }
  return (DEFAULT_ADMIN_EMAILS as readonly string[]).map((e) => e.toLowerCase());
}

export function isAdmin(userEmail: string | undefined): boolean {
  if (!userEmail || typeof userEmail !== "string") return false;
  const normalized = userEmail.trim().toLowerCase();
  return getAdminEmails().includes(normalized);
}
