"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { HelpRequestCard } from "./HelpRequestCard";
import { HelpOfferCard } from "./HelpOfferCard";
import { OfferHelpDialog } from "./OfferHelpDialog";
import { CreateOfferDialog } from "./CreateOfferDialog";
import { CreateHelpRequestDialog } from "@/app/(app)/dashboard/help/CreateHelpRequestDialog";
import { CitySelect } from "@/components/ui/city-select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InfiniteScrollTrigger } from "@/components/ui/infinite-scroll-trigger";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import {
  getHelpRequests,
  getHelpOffers,
  type HelpRequestWithRequester,
  type HelpOfferWithOfferer,
} from "./actions";

type TabValue = "requests" | "offers";

interface HelpBoardClientProps {
  initialRequests: HelpRequestWithRequester[];
  initialHasMore: boolean;
  initialOffers: HelpOfferWithOfferer[];
  initialOffersHasMore: boolean;
  filterCategory: string | undefined;
  filterLocation: string | undefined;
  categories: string[];
  defaultName: string;
  defaultContact: string;
  defaultIsAnonymous: boolean;
  /** When set, "אני רוצה לעזור" is hidden on this user's own requests. */
  currentUserId: string | null;
}

const LIMIT = 10;

export function HelpBoardClient({
  initialRequests,
  initialHasMore,
  initialOffers,
  initialOffersHasMore,
  filterCategory,
  filterLocation,
  categories,
  defaultName,
  defaultContact,
  defaultIsAnonymous,
  currentUserId,
}: HelpBoardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedRequest, setSelectedRequest] = useState<HelpRequestWithRequester | null>(null);
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [createOfferDialogOpen, setCreateOfferDialogOpen] = useState(false);

  const categoryParam = searchParams.get("category") ?? "";
  const locationParam = searchParams.get("location") ?? "";
  const [location, setLocation] = useState(locationParam);

  useEffect(() => {
    setLocation(locationParam);
  }, [locationParam]);

  const fetchRequests = useCallback(
    (offset: number, limit: number) =>
      getHelpRequests(
        { category: filterCategory, location: filterLocation },
        offset,
        limit
      ),
    [filterCategory, filterLocation]
  );

  const fetchOffers = useCallback(
    (offset: number, limit: number) =>
      getHelpOffers(
        { category: filterCategory, location: filterLocation },
        offset,
        limit
      ),
    [filterCategory, filterLocation]
  );

  const { items: requests, loadMore, hasMore, isLoading } = useInfiniteScroll({
    initialData: initialRequests,
    initialHasMore: initialHasMore,
    fetchAction: fetchRequests,
    limit: LIMIT,
  });

  const {
    items: offers,
    loadMore: loadMoreOffers,
    hasMore: offersHasMore,
    isLoading: offersLoading,
  } = useInfiniteScroll({
    initialData: initialOffers,
    initialHasMore: initialOffersHasMore,
    fetchAction: fetchOffers,
    limit: LIMIT,
  });

  function handleOfferHelp(request: HelpRequestWithRequester) {
    setSelectedRequest(request);
    setOfferDialogOpen(true);
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

  function handleSuccess() {
    router.refresh();
  }

  const loginUrl = "/login?redirect=" + encodeURIComponent("/help");

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-wrap items-center gap-2">
        {currentUserId ? (
          <>
            <Button
              variant="outline"
              className="border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300"
              onClick={() => setRequestDialogOpen(true)}
            >
              אני צריך עזרה
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={() => setCreateOfferDialogOpen(true)}
            >
              אני רוצה להציע עזרה
            </Button>
          </>
        ) : (
          <>
            <Button asChild variant="outline" className="border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300">
              <Link href={loginUrl}>אני צריך עזרה</Link>
            </Button>
            <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white">
              <Link href={loginUrl}>אני רוצה להציע עזרה</Link>
            </Button>
            <span className="text-sm text-muted-foreground">(נדרשת התחברות)</span>
          </>
        )}
      </div>

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

      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="grid w-full max-w-[280px] grid-cols-2">
          <TabsTrigger value="requests">בקשות</TabsTrigger>
          <TabsTrigger value="offers">הצעות</TabsTrigger>
        </TabsList>
        <TabsContent value="requests" className="mt-4">
          {requests.length === 0 ? (
            <div className="rounded-xl border border-dashed border-teal-200 dark:border-teal-800 p-8 text-center text-muted-foreground">
              <p className="font-medium">אין בקשות פתוחות כרגע</p>
              <p className="text-sm mt-1">נסו לשנות את הסינון או לחזור מאוחר יותר.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="animate-in fade-in duration-300 ease-out"
                  >
                    <HelpRequestCard
                      request={req}
                      onOfferHelp={handleOfferHelp}
                      isOwnRequest={currentUserId !== null && req.user_id === currentUserId}
                      reportInitialEmail={defaultContact || undefined}
                      reportInitialName={defaultName || undefined}
                    />
                  </div>
                ))}
              </div>
              <InfiniteScrollTrigger
                onLoadMore={loadMore}
                hasMore={hasMore}
                isLoading={isLoading}
                showEndMessage={requests.length > 0}
                endMessage="סוף הרשימה"
              />
            </>
          )}
        </TabsContent>
        <TabsContent value="offers" className="mt-4">
          {offers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-teal-200 dark:border-teal-800 p-8 text-center text-muted-foreground">
              <p className="font-medium">אין הצעות עזרה כרגע</p>
              <p className="text-sm mt-1">נסו לשנות את הסינון או לחזור מאוחר יותר.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="animate-in fade-in duration-300 ease-out"
                  >
                    <HelpOfferCard
                      offer={offer}
                      seekerDisplayName={defaultName || undefined}
                      seekerEmail={defaultContact || undefined}
                    />
                  </div>
                ))}
              </div>
              <InfiniteScrollTrigger
                onLoadMore={loadMoreOffers}
                hasMore={offersHasMore}
                isLoading={offersLoading}
                showEndMessage={offers.length > 0}
                endMessage="סוף הרשימה"
              />
            </>
          )}
        </TabsContent>
      </Tabs>

      <OfferHelpDialog
        request={selectedRequest}
        open={offerDialogOpen}
        onOpenChange={setOfferDialogOpen}
        defaultName={defaultName}
        defaultContact={defaultContact}
      />

      <CreateHelpRequestDialog
        open={requestDialogOpen}
        onOpenChange={setRequestDialogOpen}
        categories={categories}
        defaultIsAnonymous={defaultIsAnonymous}
        onSuccess={handleSuccess}
      />

      <CreateOfferDialog
        open={createOfferDialogOpen}
        onOpenChange={setCreateOfferDialogOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
