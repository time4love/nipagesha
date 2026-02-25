"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, HandHeart } from "lucide-react";
import { MyRequestsList } from "./MyRequestsList";
import { CreateHelpRequestDialog } from "./CreateHelpRequestDialog";
import { EditHelpRequestDialog } from "./EditHelpRequestDialog";
import { getOffersForRequest } from "./actions";
import type { HelpRequestRow } from "@/lib/supabase/types";

interface HelpSectionClientProps {
  requests: HelpRequestRow[];
  categories: string[];
  /** When false, new requests default to showing name (matches profile "not anonymous"). */
  defaultIsAnonymous: boolean;
  /** Unread help offer count per request id (for "הצעת עזרה חדשה!" badge). */
  unreadByRequest: Record<string, number>;
}

export function HelpSectionClient({
  requests,
  categories,
  defaultIsAnonymous,
  unreadByRequest,
}: HelpSectionClientProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<HelpRequestRow | null>(null);

  const hasItems = requests.length > 0;

  function handleSuccess() {
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4" dir="rtl">
      <CreateHelpRequestDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        categories={categories}
        defaultIsAnonymous={defaultIsAnonymous}
        onSuccess={handleSuccess}
      />

      <EditHelpRequestDialog
        request={editingRequest}
        open={!!editingRequest}
        onOpenChange={(open) => !open && setEditingRequest(null)}
        categories={categories}
        onSuccess={handleSuccess}
      />

      {!hasItems ? (
        /* Case A: NO ITEMS — only empty state card; no filter tabs in DOM */
        <Card className="w-full border-teal-200 dark:border-teal-800 border-dashed">
          <CardHeader className="text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground mb-2">
              <HandHeart className="size-7" aria-hidden />
            </div>
            <CardTitle className="text-xl">הקהילה כאן בשבילך</CardTitle>
            <CardDescription className="max-w-sm mx-auto">
              עדיין אין כאן פעילות. זה המקום לבקש עזרה או להציע סיוע.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3 pb-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setCreateOpen(true)}
                className="inline-flex items-center gap-2"
              >
                <Plus className="size-4" aria-hidden />
                בקש עזרה
              </Button>
              <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700 text-white">
                <Link href="/help?action=offer" className="inline-flex items-center gap-2">
                  <Plus className="size-4" aria-hidden />
                  הצע עזרה
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Case B: HAS ITEMS — filter/nav row + Create New + grid */
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">← לוח בקרה</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/help">לוח עזרה</Link>
              </Button>
            </div>
            <Button
              className="bg-teal-600 hover:bg-teal-700 text-white shrink-0"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4 ml-2" aria-hidden />
              פרסם בקשה
            </Button>
          </div>

          <MyRequestsList
            requests={requests}
            getOffers={getOffersForRequest}
            onEditRequest={setEditingRequest}
            unreadByRequest={unreadByRequest}
          />
        </>
      )}
    </div>
  );
}
