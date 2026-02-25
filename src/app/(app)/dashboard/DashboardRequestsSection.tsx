"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, HandHeart, ChevronLeft } from "lucide-react";
import { MyRequestsList } from "./help/MyRequestsList";
import { CreateHelpRequestDialog } from "./help/CreateHelpRequestDialog";
import { EditHelpRequestDialog } from "./help/EditHelpRequestDialog";
import { getOffersForRequest } from "./help/actions";
import type { HelpRequestRow } from "@/lib/supabase/types";

interface DashboardRequestsSectionProps {
  requests: HelpRequestRow[];
  categories: string[];
  defaultIsAnonymous: boolean;
  unreadByRequest: Record<string, number>;
}

export function DashboardRequestsSection({
  requests,
  categories,
  defaultIsAnonymous,
  unreadByRequest,
}: DashboardRequestsSectionProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<HelpRequestRow | null>(null);

  function handleSuccess() {
    router.refresh();
  }

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold text-foreground">הבקשות שלי</h2>
          {requests.length > 0 && (
            <Button
              size="sm"
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4" aria-hidden />
              בקש עזרה
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

      {requests.length === 0 ? (
        <Card className="border-teal-200 dark:border-teal-800 border-dashed">
          <CardHeader className="text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground mb-2">
              <HandHeart className="size-7" aria-hidden />
            </div>
            <CardTitle className="text-xl">לא ביקשת עזרה עדיין</CardTitle>
            <CardDescription className="max-w-sm mx-auto">
              פרסם בקשה בלוח העזרה כדי לקבל סיוע מהקהילה.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <Button
              size="lg"
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4" aria-hidden />
              בקש עזרה
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <MyRequestsList
            requests={requests}
            getOffers={getOffersForRequest}
            onEditRequest={setEditingRequest}
            unreadByRequest={unreadByRequest}
          />
        </div>
      )}

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
    </div>
  );
}
