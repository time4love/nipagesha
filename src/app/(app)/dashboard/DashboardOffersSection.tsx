"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, HandHeart, ChevronLeft, Pencil } from "lucide-react";
import { EditHelpRequestDialog } from "./help/EditHelpRequestDialog";
import { deleteHelpRequest } from "./help/actions";
import type { HelpRequestRow } from "@/lib/supabase/types";

const STATUS_LABELS: Record<HelpRequestRow["status"], string> = {
  pending: "ממתין לאישור",
  approved: "מאושר (לוח)",
  rejected: "נדחה",
  closed: "סגור",
};

interface DashboardOffersSectionProps {
  offers: HelpRequestRow[];
  categories: string[];
}

export function DashboardOffersSection({
  offers,
  categories,
}: DashboardOffersSectionProps) {
  const router = useRouter();
  const [editingOffer, setEditingOffer] = useState<HelpRequestRow | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(offerId: string) {
    setError(null);
    const res = await deleteHelpRequest(offerId);
    if (res.error) setError(res.error);
    else if (res.success) {
      setDeleteConfirmId(null);
      router.refresh();
    }
  }

  function handleSuccess() {
    router.refresh();
    setEditingOffer(null);
  }

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold text-foreground">הצעות העזרה שלי</h2>
          {offers.length > 0 && (
            <Button asChild size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
              <Link href="/help?action=offer" className="inline-flex items-center gap-2">
                <Plus className="size-4" aria-hidden />
                הצע עזרה
              </Link>
            </Button>
          )}
        </div>
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground shrink-0">
          <Link href="/help" className="inline-flex items-center gap-1">
            למעבר ללוח העזרה הציבורי
            <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden />
          </Link>
        </Button>
      </div>

      {offers.length === 0 ? (
        <Card className="border-teal-200 dark:border-teal-800 border-dashed">
          <CardHeader className="text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground mb-2">
              <HandHeart className="size-7" aria-hidden />
            </div>
            <CardTitle className="text-xl">לא הצעת עזרה עדיין</CardTitle>
            <CardDescription className="max-w-sm mx-auto">
              פרסם הצעת עזרה בלוח העזרה כדי שהורים יוכלו ליצור איתך קשר.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700 text-white">
              <Link href="/help?action=offer" className="inline-flex items-center gap-2">
                <Plus className="size-4" aria-hidden />
                הצע עזרה
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => (
              <Card key={offer.id} className="border-teal-100 dark:border-teal-900/50">
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-lg">{offer.title}</CardTitle>
                    <Badge
                      variant={
                        offer.status === "approved"
                          ? "default"
                          : offer.status === "pending"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {STATUS_LABELS[offer.status]}
                    </Badge>
                    {offer.location ? (
                      <span className="text-sm text-muted-foreground">📍 {offer.location}</span>
                    ) : null}
                  </div>
                  {offer.status === "rejected" && offer.rejection_reason ? (
                    <div className="rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30 p-3 mt-2">
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                        סיבת הדחייה:
                      </p>
                      <p className="text-sm text-amber-900 dark:text-amber-100 whitespace-pre-wrap">
                        {offer.rejection_reason}
                      </p>
                    </div>
                  ) : null}
                  <p className="text-sm text-muted-foreground line-clamp-2 whitespace-pre-wrap mt-2">
                    {offer.description}
                  </p>
                </CardHeader>
                <CardFooter className="flex flex-wrap gap-2 pt-0">
                  {offer.status === "pending" && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingOffer(offer)}
                      aria-label={`ערוך הצעה: ${offer.title}`}
                    >
                      <Pencil className="size-4 ml-1 rtl:mr-1" aria-hidden />
                      ערוך
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleteConfirmId(offer.id)}
                  >
                    מחק הצעה
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      <EditHelpRequestDialog
        request={editingOffer}
        open={!!editingOffer}
        onOpenChange={(open) => !open && setEditingOffer(null)}
        categories={categories}
        onSuccess={handleSuccess}
        isOffer
      />

      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>מחיקת הצעה</DialogTitle>
            <DialogDescription>
              האם למחוק את ההצעה? פעולה זו לא ניתנת לביטול.
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
