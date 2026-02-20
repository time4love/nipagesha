"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { setSubmissionStatusResolved } from "./actions";
import type { ContactStatus, ContactSubmissionRow } from "@/lib/supabase/types";
import { Check } from "lucide-react";

const categoryLabels: Record<string, string> = {
  general: "כללי",
  support: "תמיכה",
  bug: "באג",
  report_abuse: "דיווח שימוש לרעה",
  report_content: "דיווח תוכן",
};

const statusLabels: Record<ContactStatus, string> = {
  open: "פתוח",
  in_progress: "בטיפול",
  resolved: "טופל",
};

interface AdminInboxClientProps {
  submissions: ContactSubmissionRow[];
}

export function AdminInboxClient({ submissions: initialSubmissions }: AdminInboxClientProps) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [statusFilter, setStatusFilter] = useState<ContactStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"date" | "status">("date");
  const [selected, setSelected] = useState<ContactSubmissionRow | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = statusFilter === "all"
      ? submissions
      : submissions.filter((s) => s.status === statusFilter);
    if (sortBy === "date") {
      list = [...list].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else {
      const order: ContactStatus[] = ["open", "in_progress", "resolved"];
      list = [...list].sort(
        (a, b) => order.indexOf(a.status) - order.indexOf(b.status)
      );
    }
    return list;
  }, [submissions, statusFilter, sortBy]);

  async function handleResolve(id: string) {
    setError(null);
    setLoadingId(id);
    const res = await setSubmissionStatusResolved(id);
    setLoadingId(null);
    if (res.error) {
      setError(res.error);
      return;
    }
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "resolved" as const } : s))
    );
    if (selected?.id === id) setSelected(null);
  }

  if (submissions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground" dir="rtl">
        <p className="font-medium">אין פניות בתיבה</p>
        <p className="text-sm mt-1">פניות מטופס צור קשר ודיווחים יופיעו כאן.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="filter_status" className="text-sm font-medium text-muted-foreground">
          סטטוס:
        </label>
        <select
          id="filter_status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ContactStatus | "all")}
          className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="all">הכל</option>
          <option value="open">פתוח</option>
          <option value="in_progress">בטיפול</option>
          <option value="resolved">טופל</option>
        </select>
        <label htmlFor="sort_by" className="text-sm font-medium text-muted-foreground">
          מיון:
        </label>
        <select
          id="sort_by"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "date" | "status")}
          className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="date">תאריך (חדש לישן)</option>
          <option value="status">סטטוס</option>
        </select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>תאריך</TableHead>
            <TableHead>קטגוריה</TableHead>
            <TableHead>נושא</TableHead>
            <TableHead>מאת</TableHead>
            <TableHead>סטטוס</TableHead>
            <TableHead className="w-[100px]">פעולה</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((s) => (
            <TableRow
              key={s.id}
              className="cursor-pointer"
              onClick={() => setSelected(s)}
            >
              <TableCell>
                {new Date(s.created_at).toLocaleString("he-IL", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </TableCell>
              <TableCell>{categoryLabels[s.category] ?? s.category}</TableCell>
              <TableCell className="max-w-[200px] truncate">{s.subject}</TableCell>
              <TableCell>
                {s.name} &lt;{s.email}&gt;
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    s.status === "resolved"
                      ? "secondary"
                      : s.status === "in_progress"
                        ? "outline"
                        : "default"
                  }
                >
                  {statusLabels[s.status]}
                </Badge>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                {s.status !== "resolved" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResolve(s.id)}
                    disabled={loadingId === s.id}
                    aria-label={`סמן כטופל: ${s.subject}`}
                  >
                    {loadingId === s.id ? (
                      "…"
                    ) : (
                      <>
                        <Check className="size-4 ml-1" aria-hidden />
                        טופל
                      </>
                    )}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.subject}</DialogTitle>
                <DialogDescription asChild>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge>{categoryLabels[selected.category] ?? selected.category}</Badge>
                    <Badge variant="secondary">{statusLabels[selected.status]}</Badge>
                    <span className="text-muted-foreground text-sm">
                      {new Date(selected.created_at).toLocaleString("he-IL", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <p className="text-sm">
                  <span className="font-medium text-muted-foreground">מאת:</span>{" "}
                  {selected.name} &lt;{selected.email}&gt;
                </p>
                {(selected.reference_type || selected.reference_id) && (
                  <p className="text-sm">
                    <span className="font-medium text-muted-foreground">קישור:</span>{" "}
                    {selected.reference_type ?? "—"} – {selected.reference_id ?? "—"}
                  </p>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">הודעה</p>
                  <p className="text-sm whitespace-pre-wrap">{selected.message}</p>
                </div>
                {selected.status !== "resolved" && (
                  <Button
                    className="mt-2"
                    onClick={() => handleResolve(selected.id)}
                    disabled={loadingId === selected.id}
                  >
                    {loadingId === selected.id ? "שולח…" : "סמן כטופל"}
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
