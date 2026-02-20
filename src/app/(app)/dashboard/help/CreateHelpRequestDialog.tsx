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
import { createHelpRequest } from "@/app/help/actions";

interface CreateHelpRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: string[];
  /** When true, new request will show your name if profile is visible. Matches profile "not anonymous" setting. */
  defaultIsAnonymous: boolean;
  onSuccess: () => void;
}

export function CreateHelpRequestDialog({
  open,
  onOpenChange,
  categories,
  defaultIsAnonymous,
  onSuccess,
}: CreateHelpRequestDialogProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(defaultIsAnonymous);

  useEffect(() => {
    if (open) {
      setIsAnonymous(defaultIsAnonymous);
    }
  }, [open, defaultIsAnonymous]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const formData = new FormData(e.currentTarget);
    formData.set("is_anonymous", isAnonymous ? "true" : "false");
    const res = await createHelpRequest(formData);
    setPending(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    if (res.success) {
      onSuccess();
      onOpenChange(false);
      (e.target as HTMLFormElement).reset();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>פרסם בקשה ללוח העזרה</DialogTitle>
          <DialogDescription>
            הבקשה תופיע בלוח העזרה הציבורי. משתמשים יוכלו ליצור איתכם קשר אם ירצו לעזור.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="create_title">כותרת *</Label>
            <Input
              id="create_title"
              name="title"
              required
              placeholder="למשל: ציוד לתינוק באזור תל אביב"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create_description">תיאור</Label>
            <textarea
              id="create_description"
              name="description"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="פרטים נוספים"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create_category">קטגוריה *</Label>
            <Input
              id="create_category"
              name="category"
              required
              list="create_categories"
              placeholder="למשל: ציוד, טיפול, לימודים"
            />
            <datalist id="create_categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div className="space-y-2">
            <Label htmlFor="create_location">אזור (אופציונלי)</Label>
            <Input
              id="create_location"
              name="location"
              placeholder="עיר או אזור"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="hidden"
              name="is_anonymous"
              value={isAnonymous ? "true" : "false"}
            />
            <input
              type="checkbox"
              id="create_is_anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded border-input"
            />
            <Label htmlFor="create_is_anonymous">הצג את הבקשה כאנונימית (הורה אנונימי)</Label>
          </div>
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
              {pending ? "שולח…" : "פרסם בקשה"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
