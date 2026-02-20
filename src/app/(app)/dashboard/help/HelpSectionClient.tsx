"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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

  function handleSuccess() {
    router.refresh();
  }

  return (
    <div className="space-y-6" dir="rtl">
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

      <MyRequestsList
        requests={requests}
        getOffers={getOffersForRequest}
        onEditRequest={setEditingRequest}
        unreadByRequest={unreadByRequest}
      />
    </div>
  );
}
