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
import { submitContactForm } from "@/app/contact/actions";
import { cn } from "@/lib/utils";

export interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referenceId: string;
  referenceType: string;
  contentTitle: string;
  /** When provided (e.g. logged-in user), email field is hidden and this is used. */
  initialEmail?: string;
  /** When provided with initialEmail, name field is hidden and this is used. */
  initialName?: string;
}

export function ReportDialog({
  open,
  onOpenChange,
  referenceId,
  referenceType,
  contentTitle,
  initialEmail,
  initialName,
}: ReportDialogProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isLoggedIn = Boolean(initialEmail?.trim());

  function handleClose(open: boolean) {
    if (!open) {
      setError(null);
      setSuccess(false);
    }
    onOpenChange(open);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const email = initialEmail?.trim() ?? (form.elements.namedItem("email") as HTMLInputElement)?.value?.trim();
    const rawName = initialName?.trim() ?? (form.elements.namedItem("name") as HTMLInputElement)?.value?.trim();
    const name = rawName || "דיווח אנונימי";
    const message = (form.elements.namedItem("message") as HTMLTextAreaElement)?.value?.trim();

    if (!email || !message) {
      setError("נא למלא אימייל והודעת דיווח.");
      setPending(false);
      return;
    }

    const res = await submitContactForm({
      name,
      email,
      category: "report_abuse",
      subject: `Reporting: ${contentTitle}`,
      message,
      reference_id: referenceId,
      reference_type: referenceType,
    });
    setPending(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setSuccess(true);
    setTimeout(() => {
      handleClose(false);
    }, 1500);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>דיווח על תוכן לא הולם</DialogTitle>
          <DialogDescription>
            דיווח על: &quot;{contentTitle}&quot;. נטפל בבקשה בהקדם.
          </DialogDescription>
        </DialogHeader>
        {success ? (
          <p className="py-4 text-center text-sm text-teal-700 dark:text-teal-300" role="status">
            הדיווח נשלח. תודה.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            {!isLoggedIn && (
              <div className="space-y-2">
                <Label htmlFor="report-email">אימייל *</Label>
                <Input
                  id="report-email"
                  name="email"
                  type="email"
                  required
                  placeholder="example@email.com"
                  autoComplete="email"
                  disabled={pending}
                />
              </div>
            )}
            {!isLoggedIn && (
              <div className="space-y-2">
                <Label htmlFor="report-name">שם (אופציונלי)</Label>
                <Input
                  id="report-name"
                  name="name"
                  type="text"
                  placeholder="למען המעקב"
                  disabled={pending}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="report-message">סיבת הדיווח *</Label>
              <textarea
                id="report-message"
                name="message"
                required
                rows={3}
                placeholder="תארו בקצרה את הבעיה..."
                disabled={pending}
                className={cn(
                  "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors",
                  "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-y min-h-[80px]"
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={pending}
              >
                ביטול
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "שולח..." : "שליחת דיווח"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
