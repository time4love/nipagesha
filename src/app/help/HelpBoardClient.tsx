"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HelpRequestCard } from "./HelpRequestCard";
import { OfferHelpDialog } from "./OfferHelpDialog";
import { CitySelect } from "@/components/ui/city-select";
import type { HelpRequestWithRequester } from "./actions";

interface HelpBoardClientProps {
  requests: HelpRequestWithRequester[];
  categories: string[];
  defaultName: string;
  defaultContact: string;
  /** When set, "אני רוצה לעזור" is hidden on this user's own requests. */
  currentUserId: string | null;
}

export function HelpBoardClient({
  requests,
  categories,
  defaultName,
  defaultContact,
  currentUserId,
}: HelpBoardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedRequest, setSelectedRequest] = useState<HelpRequestWithRequester | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const categoryParam = searchParams.get("category") ?? "";
  const locationParam = searchParams.get("location") ?? "";
  const [location, setLocation] = useState(locationParam);

  useEffect(() => {
    setLocation(locationParam);
  }, [locationParam]);

  function handleOfferHelp(request: HelpRequestWithRequester) {
    setSelectedRequest(request);
    setDialogOpen(true);
  }

  function handleFilterSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const category = (form.elements.namedItem("category") as HTMLSelectElement)?.value ?? "";
    const locationValue = (form.elements.namedItem("location") as HTMLInputElement)?.value?.trim() ?? "";
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (locationValue) params.set("location", locationValue);
    router.push(`/help?${params.toString()}`);
  }

  return (
    <div className="space-y-6" dir="rtl">
      <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label htmlFor="filter_category" className="text-sm font-medium">
            קטגוריה
          </label>
          <select
            id="filter_category"
            name="category"
            className="flex h-9 w-full min-w-[140px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            defaultValue={categoryParam}
          >
            <option value="">הכל</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1 min-w-[180px]">
          <CitySelect
            id="filter_location"
            name="location"
            value={location}
            onChange={setLocation}
            label="אזור"
            clearable
            className="min-w-0"
          />
        </div>
        <button
          type="submit"
          className="h-9 rounded-md bg-teal-600 px-4 text-sm font-medium text-white hover:bg-teal-700"
        >
          סינון
        </button>
      </form>

      {requests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-teal-200 dark:border-teal-800 p-8 text-center text-muted-foreground">
          <p className="font-medium">אין בקשות פתוחות כרגע</p>
          <p className="text-sm mt-1">נסו לשנות את הסינון או לחזור מאוחר יותר.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {requests.map((req) => (
            <HelpRequestCard
              key={req.id}
              request={req}
              onOfferHelp={handleOfferHelp}
              isOwnRequest={currentUserId !== null && req.user_id === currentUserId}
            />
          ))}
        </div>
      )}

      <OfferHelpDialog
        request={selectedRequest}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultName={defaultName}
        defaultContact={defaultContact}
      />
    </div>
  );
}
