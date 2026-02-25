"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CitySelect } from "@/components/ui/city-select";
import { submitHelpOffer, type SubmitHelpOfferResult } from "./actions";
import { HELP_CATEGORIES } from "@/lib/constants";

interface CreateOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateOfferDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateOfferDialogProps) {
  const [city, setCity] = useState("");
  const [result, setResult] = useState<SubmitHelpOfferResult | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(null);
    setPending(true);
    const formData = new FormData(e.currentTarget);
    formData.set("city", city);
    const res = await submitHelpOffer(formData);
    setResult(res);
    setPending(false);
    if (res.success) {
      onSuccess();
      onOpenChange(false);
      (e.target as HTMLFormElement).reset();
      setCity("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>אני רוצה להציע עזרה</DialogTitle>
          <DialogDescription>
            פרטו באיזה סוג עזרה אתם יכולים לתרום. הפניות יישלחו לכתובת המייל שאיתה נרשמתם לאתר.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="offer_title">כותרת *</Label>
            <Input
              id="offer_title"
              name="title"
              required
              placeholder="למשל: ייעוץ משפטי בנושאי משמורת"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="offer_description">תיאור</Label>
            <textarea
              id="offer_description"
              name="description"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="פרטים על סוג העזרה שאתם מציעים"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="offer_category">קטגוריה *</Label>
            <select
              id="offer_category"
              name="category"
              required
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="בחירת קטגוריה"
            >
              <option value="">בחרו קטגוריה</option>
              {HELP_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 min-w-[180px]">
            <CitySelect
              id="offer_city"
              name="city"
              value={city}
              onChange={setCity}
              label="עיר / אזור"
              clearable
            />
          </div>
          <p className="text-sm text-muted-foreground border-t pt-3">
            ההפניות יישלחו לכתובת המייל שאיתה נרשמת לאתר.
          </p>
          {result?.error && (
            <p className="text-sm text-destructive" role="alert">
              {result.error}
            </p>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              ביטול
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {pending ? "שולח…" : "פרסם הצעה"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
