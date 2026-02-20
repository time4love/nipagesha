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
import { submitHelpOffer, type SubmitHelpOfferResult } from "./actions";
import type { HelpRequestWithRequester } from "./actions";

interface OfferHelpDialogProps {
  request: HelpRequestWithRequester | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-fill when user is logged in (from profile). */
  defaultName?: string;
  defaultContact?: string;
}

export function OfferHelpDialog({
  request,
  open,
  onOpenChange,
  defaultName = "",
  defaultContact = "",
}: OfferHelpDialogProps) {
  const [helperName, setHelperName] = useState(defaultName);
  const [helperContact, setHelperContact] = useState(defaultContact);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<SubmitHelpOfferResult | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (open) {
      setHelperName(defaultName);
      setHelperContact(defaultContact);
      setMessage("");
      setResult(null);
    }
  }, [open, defaultName, defaultContact]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!request) return;
    setPending(true);
    setResult(null);
    const formData = new FormData(e.currentTarget);
    formData.set("request_id", request.id);
    const res = await submitHelpOffer(formData);
    setResult(res);
    setPending(false);
    if (res.success) {
      onOpenChange(false);
    }
  }

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>אני רוצה לעזור</DialogTitle>
          <DialogDescription>
            השאירו את פרטיכם כדי שהמבקש יוכל ליצור איתכם קשר. פרטיכם לא יוצגו publicly.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="request_id" value={request.id} />
          <div className="space-y-2">
            <Label htmlFor="offer_helper_name">שם</Label>
            <Input
              id="offer_helper_name"
              name="helper_name"
              value={helperName}
              onChange={(e) => setHelperName(e.target.value)}
              placeholder="השם שלכם"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="offer_helper_contact">טלפון או אימייל</Label>
            <Input
              id="offer_helper_contact"
              name="helper_contact"
              type="text"
              value={helperContact}
              onChange={(e) => setHelperContact(e.target.value)}
              placeholder="טלפון או אימייל ליצירת קשר"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="offer_message">הודעה (אופציונלי)</Label>
            <textarea
              id="offer_message"
              name="message"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="כמה מילים על איך תוכלו לעזור"
            />
          </div>
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
              {pending ? "שולח…" : "שליחה"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
