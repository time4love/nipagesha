"use client";

import { useState, useEffect } from "react";
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
import { updateHelpRequest } from "./actions";
import type { HelpRequestRow } from "@/lib/supabase/types";

interface EditHelpRequestDialogProps {
  request: HelpRequestRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: string[];
  onSuccess: () => void;
  /** When true (editing an offer), hide anonymous option and use fixed title/description. */
  isOffer?: boolean;
}

export function EditHelpRequestDialog({
  request,
  open,
  onOpenChange,
  categories,
  onSuccess,
  isOffer = false,
}: EditHelpRequestDialogProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [location, setLocation] = useState("");

  useEffect(() => {
    if (open && request) {
      setIsAnonymous(isOffer ? false : request.is_anonymous);
      setLocation(request.location ?? "");
    }
  }, [open, request, isOffer]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!request) return;
    setError(null);
    setPending(true);
    const formData = new FormData(e.currentTarget);
    formData.set("is_anonymous", isOffer ? "false" : (isAnonymous ? "true" : "false"));
    const res = await updateHelpRequest(request.id, formData);
    setPending(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    if (res.success) {
      onSuccess();
      onOpenChange(false);
    }
  }

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>{isOffer ? "עריכת הצעת עזרה" : "עריכת בקשה"}</DialogTitle>
          <DialogDescription>
            {isOffer
              ? "עדכנו את פרטי ההצעה. פרטיכם יוצגו לפי הפרופיל שלכם."
              : "עדכנו את פרטי הבקשה. שינוי \"הצג כאנונימי\" ישפיע על איך ששמכם מופיע בלוח העזרה."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit_title">כותרת *</Label>
            <Input
              id="edit_title"
              name="title"
              required
              defaultValue={request.title}
              placeholder="למשל: ציוד לתינוק באזור תל אביב"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_description">תיאור</Label>
            <textarea
              id="edit_description"
              name="description"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="פרטים נוספים"
              defaultValue={request.description}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_category">קטגוריה *</Label>
            <select
              id="edit_category"
              name="category"
              required
              defaultValue={request.category}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="בחירת קטגוריה"
            >
              <option value="">בחרו קטגוריה</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <CitySelect
              id="edit_location"
              name="location"
              value={location}
              onChange={setLocation}
              label="אזור (אופציונלי)"
              clearable
            />
          </div>
          {!isOffer && (
            <>
              <div className="flex items-center gap-2">
                <input
                  type="hidden"
                  name="is_anonymous"
                  value={isAnonymous ? "true" : "false"}
                />
                <input
                  type="checkbox"
                  id="edit_is_anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded border-input"
                />
                <Label htmlFor="edit_is_anonymous">הצג את הבקשה כאנונימית (הורה אנונימי)</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                אם תבטלו את הסימון והפרופיל שלכם גלוי, שמכם יופיע על הבקשה בלוח העזרה.
              </p>
            </>
          )}
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              ביטול
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {pending ? "שומר…" : "שמור שינויים"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
