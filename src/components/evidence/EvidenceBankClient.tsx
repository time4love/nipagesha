"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ExternalLink } from "lucide-react";
import type { EvidenceItemWithSource } from "@/lib/supabase/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function normalizeForSearch(value: string): string {
  return value.trim().toLowerCase();
}

function evidenceAnchor(evidenceNumber: number): string {
  return `evidence-${evidenceNumber}`;
}

function isVideoSourceType(sourceType: string): boolean {
  const t = sourceType.trim().toLowerCase();
  return t === "video" || t.includes("youtube");
}

function formatPublicationDate(isoDate: string | null): string {
  if (!isoDate) return "—";
  try {
    return new Intl.DateTimeFormat("he-IL", {
      dateStyle: "medium",
    }).format(new Date(isoDate + "T12:00:00"));
  } catch {
    return isoDate;
  }
}

export interface EvidenceBankClientProps {
  items: EvidenceItemWithSource[];
}

export function EvidenceBankClient({ items }: EvidenceBankClientProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("הכל");
  const [openItems, setOpenItems] = useState<string[]>([]);

  const categories = useMemo(() => {
    const unique = new Set<string>();
    for (const row of items) {
      unique.add(row.category);
    }
    const sorted = Array.from(unique).sort((a, b) => a.localeCompare(b, "he"));
    return ["הכל", ...sorted];
  }, [items]);

  const filteredItems = useMemo(() => {
    if (items.length === 0) return [];
    const q = normalizeForSearch(search);
    return items.filter((row) => {
      if (activeCategory !== "הכל" && row.category !== activeCategory) {
        return false;
      }
      if (!q) return true;
      const inTitle = normalizeForSearch(row.evidence_title).includes(q);
      const inQuote = normalizeForSearch(row.verbatim_quote ?? "").includes(q);
      return inTitle || inQuote;
    });
  }, [items, search, activeCategory]);

  useEffect(() => {
    const syncHash = () => {
      const id = window.location.hash.replace(/^#/, "");
      if (!id.startsWith("evidence-")) return;
      setOpenItems((prev) => (prev.includes(id) ? prev : [...prev, id]));
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  if (items.length === 0) {
    return (
      <div className="space-y-10">
        <header className="space-y-3 border-b border-border pb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-red-600">
            תיק פתוח
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            בנק הראיות
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            מסמכים, ציטוטים וניתוח עובדתי — מסודרים לפי מקור רשמי.
          </p>
        </header>
        <p className="py-12 text-center text-muted-foreground">
          טרם פורסמו ראיות. לאחר הזנת הנתונים ב-Supabase, הן יוצגו כאן.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="space-y-3 border-b border-border pb-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-red-600">
          תיק פתוח
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          בנק הראיות
        </h1>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          מסמכים, ציטוטים וניתוח עובדתי — מסודרים לפי מקור רשמי. השתמשו בחיפוש
          ובסינון לפי נושא, או שתפו קישור ישיר לראיה ספציפית מהשורה בכתובת הדפדפן.
        </p>
      </header>

      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full max-w-md space-y-2">
            <label
              htmlFor="evidence-search"
              className="text-sm font-medium text-foreground"
            >
              חיפוש
            </label>
            <Input
              id="evidence-search"
              type="search"
              placeholder="כותרת או ציטוט…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              dir="rtl"
              autoComplete="off"
            />
          </div>
        </div>

        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="סינון לפי קטגוריה"
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <Button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isActive}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={cn(
                  "rounded-full",
                  isActive &&
                    "border-red-600 bg-red-600 text-white hover:bg-red-600/90"
                )}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </Button>
            );
          })}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          לא נמצאו ראיות התואמות את הסינון.
        </p>
      ) : (
        <Accordion
          type="multiple"
          className="space-y-3"
          value={openItems}
          onValueChange={setOpenItems}
        >
          {filteredItems.map((row) => {
            const anchor = evidenceAnchor(row.evidence_number);
            const source = row.sources;
            const sourceType = source?.type ?? "";
            const showVideo =
              Boolean(row.media_asset_url) && isVideoSourceType(sourceType);
            const showImage = Boolean(row.media_asset_url) && !showVideo;

            return (
              <AccordionItem
                key={row.id}
                value={anchor}
                id={anchor}
                className="scroll-mt-24 rounded-lg border border-border bg-muted/30 px-4 data-[state=open]:bg-muted/40"
              >
                <AccordionTrigger className="py-4 text-start hover:no-underline [&[data-state=open]>svg]:rotate-180">
                  <div className="flex w-full flex-col gap-2 pe-2 text-start sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-red-600">
                          #{row.evidence_number}
                        </span>
                        <Badge variant="outline">{row.category}</Badge>
                      </div>
                      <p className="text-base font-semibold text-foreground">
                        {row.evidence_title}
                      </p>
                      {row.speaker ? (
                        <p className="text-sm text-muted-foreground">
                          {row.speaker}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-6 border-t border-border pt-4 text-foreground">
                  {source ? (
                    <section className="space-y-2" aria-label="מקור רשמי">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        מקור
                      </h3>
                      <p className="font-medium text-foreground">{source.title}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span>תאריך: {formatPublicationDate(source.publication_date)}</span>
                        {row.exact_location ? (
                          <span>מיקום במקור: {row.exact_location}</span>
                        ) : null}
                      </div>
                      {source.official_url ? (
                        <a
                          href={source.official_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 underline-offset-4 hover:underline"
                        >
                          <ExternalLink className="size-4 shrink-0" aria-hidden />
                          קישור למסמך או לסרטון המלא
                        </a>
                      ) : null}
                    </section>
                  ) : (
                    <p className="text-sm text-amber-800">
                      מקור המסמך חסר ברשומה — יש לעדכן את מסד הנתונים.
                    </p>
                  )}

                  {row.thesis ? (
                    <section className="space-y-2" aria-label="תזה">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        תזה
                      </h3>
                      <p className="text-sm leading-relaxed">{row.thesis}</p>
                    </section>
                  ) : null}

                  {row.smoking_gun ? (
                    <section
                      className="rounded-md border-s-4 border-red-600 bg-red-50 p-4"
                      aria-label="ממצא קריטי"
                    >
                      <div className="mb-2 flex items-center gap-2 text-red-800">
                        <AlertTriangle className="size-5 shrink-0" aria-hidden />
                        <h3 className="text-sm font-bold">ממצא מרכזי</h3>
                      </div>
                      <p className="text-sm leading-relaxed text-foreground">
                        {row.smoking_gun}
                      </p>
                    </section>
                  ) : null}

                  {row.verbatim_quote ? (
                    <figure className="space-y-2">
                      <figcaption className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        ציטוט מדויק
                      </figcaption>
                      <blockquote
                        className="border-s-4 border-border bg-muted/60 py-3 ps-4 pe-3 text-base leading-relaxed text-foreground"
                        cite={source?.official_url ?? undefined}
                      >
                        {row.verbatim_quote}
                      </blockquote>
                    </figure>
                  ) : null}

                  {row.forensic_analysis ? (
                    <section className="space-y-2" aria-label="ניתוח">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        ניתוח עובדתי
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {row.forensic_analysis}
                      </p>
                    </section>
                  ) : null}

                  {showVideo ? (
                    <div className="overflow-hidden rounded-md border border-border bg-black">
                      <div className="aspect-video w-full">
                        <iframe
                          title={`מדיה — ראיה ${row.evidence_number}`}
                          src={row.media_asset_url!}
                          className="h-full w-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  ) : null}

                  {showImage ? (
                    <div className="overflow-hidden rounded-md border border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary evidence URLs */}
                      <img
                        src={row.media_asset_url!}
                        alt={`תצלום ראיה ${row.evidence_number}`}
                        className="max-h-[480px] w-full object-contain bg-muted"
                        loading="lazy"
                      />
                    </div>
                  ) : null}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}
