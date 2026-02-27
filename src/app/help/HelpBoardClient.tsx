"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { HelpRequestCard } from "./HelpRequestCard";
import { HelpOfferCard } from "./HelpOfferCard";
import { OfferHelpDialog } from "./OfferHelpDialog";
import { CreateOfferDialog } from "./CreateOfferDialog";
import { CreateHelpRequestDialog } from "@/app/(app)/dashboard/help/CreateHelpRequestDialog";
import { CitySelect } from "@/components/ui/city-select";
import { Button } from "@/components/ui/button";
import { X, HandHeart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InfiniteScrollTrigger } from "@/components/ui/infinite-scroll-trigger";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import {
  getHelpRequests,
  getHelpOffers,
  type HelpRequestWithRequester,
  type HelpOfferWithOfferer,
} from "./actions";

interface HelpBoardClientProps {
  title: string;
  subtitle: string;
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
  /** When true, open the "create offer" dialog and show the offers tab (e.g. from dashboard "הצע עזרה" link). */
  initialOpenCreateOffer?: boolean;
}

const LIMIT = 10;

export function HelpBoardClient({
  title,
  subtitle,
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
  initialOpenCreateOffer = false,
}: HelpBoardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedRequest, setSelectedRequest] = useState<HelpRequestWithRequester | null>(null);
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [createOfferDialogOpen, setCreateOfferDialogOpen] = useState(initialOpenCreateOffer);
  const [activeTab, setActiveTab] = useState<"requests" | "offers">(initialOpenCreateOffer ? "offers" : "requests");

  const categoryParam = searchParams.get("category") ?? "";
  const locationParam = searchParams.get("location") ?? "";
  const hasActiveFilters = Boolean(categoryParam || locationParam);

  function updateFilters(nextCategory: string, nextLocation: string) {
    const params = new URLSearchParams();
    if (nextCategory) params.set("category", nextCategory);
    if (nextLocation) params.set("location", nextLocation);
    router.push(`/help?${params.toString()}`);
  }

  function clearFilters() {
    router.push("/help");
  }

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

  function handleSuccess() {
    router.refresh();
  }

  const loginUrl = "/login?redirect=" + encodeURIComponent("/help");

  /** Shared filter controls: Category + City side-by-side. Wrapper is first flex child (right in RTL). */
  function FilterControls({ idPrefix }: { idPrefix: string }) {
    return (
      <div className="flex flex-wrap items-end gap-2 w-full md:w-auto">
        <div className="space-y-1">
          <label htmlFor={`${idPrefix}_category`} className="text-sm font-medium">
            קטגוריה
          </label>
          <select
            id={`${idPrefix}_category`}
            name="category"
            className="flex h-10 w-full min-w-[140px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={categoryParam}
            onChange={(e) => updateFilters(e.target.value, locationParam)}
          >
            <option value="">הכל</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1 min-w-[160px]">
          <CitySelect
            id={`${idPrefix}_location`}
            name="location"
            value={locationParam}
            onChange={(value) => updateFilters(categoryParam, value)}
            label="אזור"
            clearable
            className="min-w-0"
          />
        </div>
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clearFilters}
            className="h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="נקה סינון"
          >
            <X className="size-4" aria-hidden />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8" dir="rtl">
      {/* 1. Header: title + subtitle only (no global buttons) */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="mt-1 text-muted-foreground">{subtitle}</p>
      </div>

      {/* 2. Tabs as main wrapper: each tab has its own toolbar + content */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "requests" | "offers")} className="w-full">
        <TabsList className="grid w-full max-w-[280px] grid-cols-2">
          <TabsTrigger value="requests">בקשות</TabsTrigger>
          <TabsTrigger value="offers">הצעות</TabsTrigger>
        </TabsList>

        {/* Requests tab: toolbar (filters right, button left in RTL) then grid/empty */}
        <TabsContent value="requests" className="mt-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-6">
            <FilterControls idPrefix="req" />
            {currentUserId ? (
              <Button
                size="default"
                className="h-10 shrink-0 w-full md:w-auto bg-teal-600 hover:bg-teal-700 text-white"
                onClick={() => setRequestDialogOpen(true)}
              >
                אני צריך עזרה
              </Button>
            ) : (
              <Button asChild size="default" className="h-10 shrink-0 w-full md:w-auto bg-teal-600 hover:bg-teal-700 text-white">
                <Link href={loginUrl}>אני צריך עזרה</Link>
              </Button>
            )}
          </div>

          {requests.length === 0 ? (
            <div className="w-full rounded-xl border border-dashed border-teal-200 dark:border-teal-800 p-8 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
                <HandHeart className="size-6" aria-hidden />
              </div>
              <p className="font-medium text-muted-foreground">אין בקשות פתוחות כרגע</p>
              <p className="text-sm mt-1 text-muted-foreground">נסו לשנות את הסינון או פרסמו בקשה.</p>
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

        {/* Offers tab: toolbar (filters right, button left in RTL) then grid/empty */}
        <TabsContent value="offers" className="mt-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-6">
            <FilterControls idPrefix="off" />
            {currentUserId ? (
              <Button
                size="default"
                className="h-10 shrink-0 w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => setCreateOfferDialogOpen(true)}
              >
                אני רוצה להציע עזרה
              </Button>
            ) : (
              <Button asChild size="default" className="h-10 shrink-0 w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white">
                <Link href={loginUrl}>אני רוצה להציע עזרה</Link>
              </Button>
            )}
          </div>

          {offers.length === 0 ? (
            <div className="w-full rounded-xl border border-dashed border-teal-200 dark:border-teal-800 p-8 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
                <HandHeart className="size-6" aria-hidden />
              </div>
              <p className="font-medium text-muted-foreground">אין הצעות עזרה כרגע</p>
              <p className="text-sm mt-1 text-muted-foreground">נסו לשנות את הסינון או פרסמו הצעה.</p>
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
