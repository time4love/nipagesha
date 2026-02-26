import { redirect } from "next/navigation";

/**
 * Reports (content/abuse) are managed in the inbox.
 * Redirect so the dashboard "דיווחים על תוכן" card has a valid target.
 */
export default function AdminReportsPage() {
  redirect("/admin/inbox");
}
