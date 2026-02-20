"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitContactForm } from "./actions";
import { contactCategories, categoryLabels, type ContactFormData } from "./constants";
import { cn } from "@/lib/utils";

interface ContactFormProps {
  initialName: string;
  initialEmail: string;
}

export function ContactForm({ initialName, initialEmail }: ContactFormProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const data: ContactFormData = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem("email") as HTMLInputElement).value.trim(),
      category: (form.elements.namedItem("category") as HTMLSelectElement)
        .value as ContactFormData["category"],
      subject: (form.elements.namedItem("subject") as HTMLInputElement).value.trim(),
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value.trim(),
    };
    const res = await submitContactForm(data);
    setPending(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setSuccess(true);
    form.reset();
    if (initialName) (form.elements.namedItem("name") as HTMLInputElement).value = initialName;
    if (initialEmail) (form.elements.namedItem("email") as HTMLInputElement).value = initialEmail;
  }

  if (success) {
    return (
      <div
        className="rounded-lg border border-teal-200 bg-teal-50 p-6 text-center dark:border-teal-800 dark:bg-teal-950/30"
        role="status"
        aria-live="polite"
      >
        <p className="font-medium text-teal-800 dark:text-teal-200">
          ההודעה נשלחה בהצלחה
        </p>
        <p className="mt-1 text-sm text-teal-700 dark:text-teal-300">
          ניצור איתכם קשר בהקדם האפשרי.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" dir="rtl">
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-name">שם *</Label>
          <Input
            id="contact-name"
            name="name"
            type="text"
            required
            defaultValue={initialName}
            placeholder="השם שלכם"
            autoComplete="name"
            disabled={pending}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email">אימייל *</Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            required
            defaultValue={initialEmail}
            placeholder="example@email.com"
            autoComplete="email"
            disabled={pending}
            className="w-full"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-category">סוג הפנייה *</Label>
        <select
          id="contact-category"
          name="category"
          required
          disabled={pending}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          )}
          defaultValue="general"
        >
          {contactCategories.map((cat) => (
            <option key={cat} value={cat}>
              {categoryLabels[cat] ?? cat}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-subject">נושא *</Label>
        <Input
          id="contact-subject"
          name="subject"
          type="text"
          required
          placeholder="תקציר קצר"
          disabled={pending}
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-message">הודעה *</Label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          placeholder="פרטו את בקשתכם או את הדיווח..."
          disabled={pending}
          className={cn(
            "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-y min-h-[120px]"
          )}
        />
      </div>
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "שולח..." : "שליחה"}
      </Button>
    </form>
  );
}
