/**
 * Admin authorization. Application-level check only.
 * RLS allows all authenticated users; this restricts admin actions to listed emails.
 *
 * Set `ADMIN_EMAILS` in the deployment environment (comma-separated, case-insensitive).
 * There are no hardcoded defaults in the repository — set admins only via env/secrets.
 */

export function getAdminEmails(): string[] {
  const env = process.env.ADMIN_EMAILS;
  if (!env || typeof env !== "string") {
    return [];
  }
  return [
    ...new Set(
      env
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
    ),
  ];
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
