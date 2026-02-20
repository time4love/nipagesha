"use client";

import { useState } from "react";
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
import { Pencil } from "lucide-react";
import { updateRequestStatus, deleteHelpRequest } from "./actions";
import type { HelpRequestRow, HelpOfferRow } from "@/lib/supabase/types";

const STATUS_LABELS: Record<HelpRequestRow["status"], string> = {
  open: "פתוח",
  fulfilled: "מוגש",
  closed: "סגור",
};

interface MyRequestsListProps {
  requests: HelpRequestRow[];
  getOffers: (requestId: string) => Promise<HelpOfferRow[]>;
  onEditRequest: (request: HelpRequestRow) => void;
}

export function MyRequestsList({ requests, getOffers, onEditRequest }: MyRequestsListProps) {
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
      {requests.map((req) => (
        <Card key={req.id} className="border-teal-100 dark:border-teal-900/50">
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-lg">{req.title}</CardTitle>
              <Badge
                variant={
                  req.status === "open"
                    ? "success"
                    : req.status === "fulfilled"
                    ? "secondary"
                    : "outline"
                }
              >
                {STATUS_LABELS[req.status]}
              </Badge>
              {req.location ? (
                <span className="text-sm text-muted-foreground">📍 {req.location}</span>
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 whitespace-pre-wrap">
              {req.description}
            </p>
          </CardHeader>
          <CardContent className="pb-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => loadOffers(req.id)}
              disabled={loadingId === req.id}
              aria-expanded={offersByRequest[req.id] !== undefined}
            >
              {loadingId === req.id
                ? "טוען…"
                : offersByRequest[req.id]
                ? `הצעות שהתקבלו (${offersByRequest[req.id].length})`
                : "הצג הצעות שהתקבלו"}
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
            {req.status === "open" && (
              <>
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
                <Button
                  type="button"
                  size="sm"
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                  onClick={() => handleStatus(req.id, "fulfilled")}
                >
                  סומן כ־מוגש
                </Button>
              </>
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
      ))}

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
