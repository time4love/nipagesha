"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getHelpCategoryBadgeVariant } from "@/lib/constants";
import { setHelpRequestStatus, type PendingHelpRequest } from "./actions";
import { Check, X, ChevronLeft } from "lucide-react";

interface AdminHelpRequestsClientProps {
  requests: PendingHelpRequest[];
}

export function AdminHelpRequestsClient({ requests: initialRequests }: AdminHelpRequestsClientProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [selected, setSelected] = useState<PendingHelpRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function openDetail(req: PendingHelpRequest) {
    setSelected(req);
    setRejectionReason("");
    setError(null);
  }

  function closeDetail() {
    setSelected(null);
    setRejectionReason("");
  }

  async function handleStatus(
    requestId: string,
    status: "approved" | "rejected",
    reason?: string
  ) {
    setError(null);
    if (status === "rejected" && !reason?.trim()) {
      setError("נא לכתוב סיבת דחייה קצרה להורה.");
      return;
    }
    setLoadingId(requestId);
    const res = await setHelpRequestStatus(requestId, status, reason);
    setLoadingId(null);
    if (res.error) {
      setError(res.error);
      return;
    }
    closeDetail();
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
  }

  if (requests.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center text-muted-foreground">
          <p className="font-medium">אין בקשות ממתינות לאישור</p>
          <p className="text-sm mt-1">בקשות חדשות יופיעו כאן לאחר שפרסמו אותן משתמשים.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <p className="text-sm text-muted-foreground">
        לחצו על בקשה כדי לקרוא אותה ולאשר או לדחות.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {requests.map((req) => (
          <Card
            key={req.id}
            className="cursor-pointer border-teal-100 dark:border-teal-900/50 transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-teal-500"
            onClick={() => openDetail(req)}
          >
            <CardContent className="p-4">
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={getHelpCategoryBadgeVariant(req.category)}>
                    {req.category}
                  </Badge>
                  <span className="text-muted-foreground text-xs">
                    {new Date(req.created_at).toLocaleDateString("he-IL")}
                  </span>
                </div>
                <p className="font-medium leading-tight">{req.title}</p>
                {req.description ? (
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {req.description}
                  </p>
                ) : null}
                <span className="text-teal-600 dark:text-teal-400 text-sm font-medium inline-flex items-center gap-1 mt-1">
                  צפה ואישור/דחייה
                  <ChevronLeft className="size-4" aria-hidden />
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && closeDetail()}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selected.title}</DialogTitle>
                <DialogDescription asChild>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge variant={getHelpCategoryBadgeVariant(selected.category)}>
                      {selected.category}
                    </Badge>
                    <span className="text-muted-foreground text-sm">
                      {new Date(selected.created_at).toLocaleDateString("he-IL", {
                        dateStyle: "medium",
                      })}
                    </span>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                {selected.description ? (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">תיאור</p>
                    <p className="text-sm whitespace-pre-wrap">{selected.description}</p>
                  </div>
                ) : null}
                {selected.location ? (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">אזור</p>
                    <p className="text-sm">{selected.location}</p>
                  </div>
                ) : null}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">מפרסם</p>
                  <p className="text-sm">
                    {selected.is_anonymous
                      ? "אנונימי"
                      : selected.requester_display_name ?? "—"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rejection_reason" className="text-sm font-medium text-muted-foreground">
                    סיבת הדחייה (חובה בעת דחייה)
                  </Label>
                  <textarea
                    id="rejection_reason"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="הסבר קצר שיוצג להורה למה הבקשה נדחתה"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    aria-describedby="rejection_reason_hint"
                  />
                  <p id="rejection_reason_hint" className="text-xs text-muted-foreground">
                    יופיע רק אם תבחרו לדחות את הבקשה.
                  </p>
                </div>
              </div>
              <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-start">
                <Button
                  variant="destructive"
                  onClick={() => handleStatus(selected.id, "rejected", rejectionReason)}
                  disabled={loadingId === selected.id}
                  aria-label={`דחה בקשה: ${selected.title}`}
                >
                  <X className="size-4 ml-2" aria-hidden />
                  דחה
                </Button>
                <Button
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                  onClick={() => handleStatus(selected.id, "approved")}
                  disabled={loadingId === selected.id}
                  aria-label={`אשר בקשה: ${selected.title}`}
                >
                  {loadingId === selected.id ? (
                    "שולח…"
                  ) : (
                    <>
                      <Check className="size-4 ml-2" aria-hidden />
                      אשר
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
