"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, MessageSquare } from "lucide-react";
import { updateRequestStatus, deleteHelpRequest } from "./actions";
import type { HelpRequestRow, HelpOfferRow } from "@/lib/supabase/types";

const STATUS_LABELS: Record<HelpRequestRow["status"], string> = {
  pending: "ממתין לאישור",
  approved: "מאושר (לוח)",
  rejected: "נדחה",
  closed: "סגור",
};

interface MyRequestsListProps {
  requests: HelpRequestRow[];
  getOffers: (requestId: string) => Promise<HelpOfferRow[]>;
  onEditRequest: (request: HelpRequestRow) => void;
  /** Unread help offer count per request id (for prominent "הצעת עזרה חדשה!" badge). */
  unreadByRequest: Record<string, number>;
}

export function MyRequestsList({
  requests,
  getOffers,
  onEditRequest,
  unreadByRequest,
}: MyRequestsListProps) {
  const router = useRouter();
  const [offersByRequest, setOffersByRequest] = useState<Record<string, HelpOfferRow[]>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadOffers(requestId: string) {
    if (offersByRequest[requestId] !== undefined) return;
    setLoadingId(requestId);
    try {
      const list = await getOffers(requestId);
      setOffersByRequest((prev) => ({ ...prev, [requestId]: list }));
      router.refresh();
    } finally {
      setLoadingId(null);
    }
  }

  async function handleStatus(requestId: string, status: HelpRequestRow["status"]) {
    setError(null);
    const res = await updateRequestStatus(requestId, status);
    if (res.error) setError(res.error);
    else if (res.success) {
      setOffersByRequest((prev) => {
        const next = { ...prev };
        delete next[requestId];
        return next;
      });
    }
  }

  async function handleDelete(requestId: string) {
    setError(null);
    const res = await deleteHelpRequest(requestId);
    if (res.error) setError(res.error);
    else if (res.success) {
      setDeleteConfirmId(null);
      setOffersByRequest((prev) => {
        const next = { ...prev };
        delete next[requestId];
        return next;
      });
    }
  }

  if (requests.length === 0) {
    return (
      <Card className="border-teal-200 dark:border-teal-800 border-dashed">
        <CardContent className="py-8 text-center text-muted-foreground">
          <p className="font-medium">אין לכם בקשות עדיין</p>
          <p className="text-sm mt-1">פרסמו בקשה בלוח העזרה כדי לקבל עזרה מהקהילה.</p>
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
      {requests.map((req) => {
        const unreadCount = unreadByRequest[req.id] ?? 0;
        return (
        <Card key={req.id} className="border-teal-100 dark:border-teal-900/50 relative">
          {unreadCount > 0 && (
            <span
              className="absolute top-2 left-2 rtl:left-auto rtl:right-2 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500 text-amber-950"
              aria-label={`${unreadCount} הצעות עזרה חדשות`}
            >
              הצעת עזרה חדשה!
            </span>
          )}
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-lg">{req.title}</CardTitle>
              <Badge
                variant={
                  req.status === "approved"
                    ? "success"
                    : req.status === "pending"
                    ? "secondary"
                    : req.status === "rejected"
                    ? "outline"
                    : "outline"
                }
              >
                {STATUS_LABELS[req.status]}
              </Badge>
              {req.location ? (
                <span className="text-sm text-muted-foreground">📍 {req.location}</span>
              ) : null}
            </div>
            {req.status === "rejected" && req.rejection_reason ? (
              <div className="rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30 p-3 mt-2">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                  סיבת הדחייה:
                </p>
                <p className="text-sm text-amber-900 dark:text-amber-100 whitespace-pre-wrap">
                  {req.rejection_reason}
                </p>
              </div>
            ) : null}
            <p className="text-sm text-muted-foreground line-clamp-2 whitespace-pre-wrap mt-2">
              {req.description}
            </p>
          </CardHeader>
          <CardContent className="pb-2">
            <Button
              type="button"
              variant={unreadCount > 0 ? "default" : "ghost"}
              size="sm"
              className={
                unreadCount > 0
                  ? "w-fit gap-1 bg-teal-600 hover:bg-teal-700 text-white border-teal-600"
                  : "w-fit gap-1"
              }
              onClick={() => loadOffers(req.id)}
              disabled={loadingId === req.id}
              aria-expanded={offersByRequest[req.id] !== undefined}
              aria-label={
                unreadCount > 0
                  ? `הצעות חדשות – הצג ${unreadCount} הצעות שהתקבלו`
                  : undefined
              }
            >
              <MessageSquare className="size-4" aria-hidden />
              {loadingId === req.id
                ? "טוען…"
                : offersByRequest[req.id]
                ? `הצעות שהתקבלו (${offersByRequest[req.id].length})`
                : "הצג הצעות שהתקבלו"}
              {unreadCount > 0 && (
                <span className="mr-1 rtl:ml-1 rounded-full bg-amber-500 text-amber-950 text-xs px-1.5">
                  {unreadCount}
                </span>
              )}
            </Button>
            {offersByRequest[req.id] !== undefined && (
              <ul className="mt-3 space-y-2 border-t pt-3">
                {offersByRequest[req.id].length === 0 ? (
                  <li className="text-sm text-muted-foreground">אין עדיין הצעות.</li>
                ) : (
                  offersByRequest[req.id].map((offer) => (
                    <li
                      key={offer.id}
                      className="rounded-lg border bg-muted/50 p-3 text-sm"
                    >
                      <p className="font-medium">{offer.helper_name}</p>
                      <p className="text-muted-foreground">
                        יצירת קשר: {offer.helper_contact}
                      </p>
                      {offer.message ? (
                        <p className="mt-1 whitespace-pre-wrap">{offer.message}</p>
                      ) : null}
                    </li>
                  ))
                )}
              </ul>
            )}
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2 pt-0">
            {req.status === "pending" && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onEditRequest(req)}
                aria-label={`ערוך בקשה: ${req.title}`}
              >
                <Pencil className="size-4 ml-1" aria-hidden />
                ערוך
              </Button>
            )}
            {(req.status === "pending" || req.status === "approved") && (
              <Button
                type="button"
                size="sm"
                className="bg-teal-600 hover:bg-teal-700 text-white"
                onClick={() => handleStatus(req.id, "closed")}
              >
                סומן כסגור
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setDeleteConfirmId(req.id)}
            >
              מחק בקשה
            </Button>
          </CardFooter>
        </Card>
      );
      })}

      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>מחיקת בקשה</DialogTitle>
            <DialogDescription>
              האם למחוק את הבקשה? פעולה זו לא ניתנת לביטול.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDeleteConfirmId(null)}>
              ביטול
            </Button>
            {deleteConfirmId && (
              <Button
                variant="destructive"
                onClick={() => handleDelete(deleteConfirmId)}
              >
                מחק
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
