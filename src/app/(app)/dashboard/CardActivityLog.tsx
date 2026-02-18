import { AlertCircle, Eye } from "lucide-react";

export interface CardActivityLogProps {
  /** When the message was last successfully opened (from access log). */
  lastReadAt: Date | null;
  /** Number of failed attempts in the last 7 days. */
  failureCount7d: number;
  /** Total failed attempts (all time). */
  failureCountAll: number;
}

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("he-IL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function CardActivityLog({
  lastReadAt,
  failureCount7d,
  failureCountAll,
}: CardActivityLogProps) {
  return (
    <div className="flex flex-col gap-1 text-sm" aria-label="יומן גישה לכרטיס">
      {lastReadAt !== null && (
        <p className="text-muted-foreground flex items-center gap-1.5" dir="rtl">
          <Eye className="size-3.5 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden />
          <span>נצפה לאחרונה: {formatDate(lastReadAt)}</span>
        </p>
      )}
      {failureCountAll > 0 && (
        <p className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400" dir="rtl">
          <AlertCircle className="size-3.5 shrink-0" aria-hidden />
          <span>
            נסיונות כושלים: {failureCountAll}
            {failureCount7d !== failureCountAll && ` (7 ימים: ${failureCount7d})`}
          </span>
        </p>
      )}
    </div>
  );
}
