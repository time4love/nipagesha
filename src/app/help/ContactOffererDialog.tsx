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
import { contactOfferer, type ContactOffererResult } from "./actions";
import type { HelpOfferWithOfferer } from "./actions";

interface ContactOffererDialogProps {
  offer: HelpOfferWithOfferer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultName?: string;
  defaultEmail?: string;
}

export function ContactOffererDialog({
  offer,
  open,
  onOpenChange,
  defaultName = "",
  defaultEmail = "",
}: ContactOffererDialogProps) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<ContactOffererResult | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (open) {
      setName(defaultName);
      setEmail(defaultEmail);
      setMessage("");
      setResult(null);
    }
  }, [open, defaultName, defaultEmail]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(null);
    setPending(true);
    const res = await contactOfferer(offer.id, message, { name, email });
    setResult(res);
    setPending(false);
    if (res.success) {
      setMessage("");
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>צור קשר עם המציע/ה</DialogTitle>
          <DialogDescription>
            ההודעה תשלח לכתובת המייל של המציע/ה. הם יוכלו ליצור איתכם קשר בחזרה.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact_offerer_name">שמכם</Label>
            <Input
              id="contact_offerer_name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="השם שלכם"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_offerer_email">אימייל ליצירת קשר</Label>
            <Input
              id="contact_offerer_email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="כתובת המייל שלכם"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_offerer_message">הודעה</Label>
            <textarea
              id="contact_offerer_message"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="ספרו במה אתם צריכים עזרה..."
              required
            />
          </div>
          {result?.error && (
            <p className="text-sm text-destructive" role="alert">
              {result.error}
            </p>
          )}
          {result?.success && (
            <p className="text-sm text-teal-600 dark:text-teal-400" role="status">
              ההודעה נשלחה. המציע/ה ייצור/תיצור איתכם קשר בהקדם.
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
