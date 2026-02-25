"use client";

import { useState } from "react";
import { decryptMessage } from "@/lib/crypto";
import { formatChildName } from "@/lib/child-card";
import { MessageCard } from "@/components/message/MessageCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorMessage } from "@/components/ui/error-message";
import { logAccessAttempt, sendReply } from "@/app/message/actions";
import type { MessagePageCard } from "@/lib/supabase/types";

const WRONG_ANSWER_MESSAGE = "התשובה אינה נכונה, נסה שוב";
const FALLBACK_CHILD_LABEL = "הילד";
const REPLY_SUCCESS_MESSAGE =
  "ההודעה נשלחה בהצלחה! תודה שיצרת קשר.";

function ChildReplySection({
  cardId,
  parentReplyLabel,
}: {
  cardId: string;
  parentReplyLabel: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmitReply(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await sendReply(cardId, content, contactInfo || undefined);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      setContent("");
      setContactInfo("");
      setShowForm(false);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Card className="border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/30">
        <CardContent className="pt-6">
          <p className="text-center text-teal-800 dark:text-teal-200 font-medium">
            {REPLY_SUCCESS_MESSAGE}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-teal-200/80 dark:border-teal-800/80">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">יצירת קשר</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showForm ? (
          <Button
            type="button"
            variant="outline"
            className="w-full border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/50"
            onClick={() => setShowForm(true)}
          >
            שלח תגובה ל{parentReplyLabel}
          </Button>
        ) : (
          <form onSubmit={handleSubmitReply} className="space-y-4" dir="rtl">
            {error && <ErrorMessage message={error} />}
            <label className="block text-sm font-medium text-right">
              ההודעה שלך
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="כתוב כאן את מה שתרצה לומר..."
                rows={4}
                required
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-right text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="ההודעה שלך"
              />
            </label>
            <label className="block text-sm font-medium text-right">
              פרטי התקשרות (אופציונלי)
              <Input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="טלפון או אימייל"
                className="mt-2 text-right"
                aria-label="פרטי התקשרות"
              />
            </label>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowForm(false)}
              >
                ביטול
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                {loading ? "שולח..." : "שלח תגובה"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export function MessageUnlockClient({
  card,
  parentReplyLabel,
}: {
  card: MessagePageCard;
  parentReplyLabel: string;
}) {
  const [answer, setAnswer] = useState("");
  const [decryptedHtml, setDecryptedHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const childName = formatChildName(card.child_first_name);

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const html = await decryptMessage(card.encrypted_message, answer.trim());
      setDecryptedHtml(html);
      await logAccessAttempt(card.id, true);
    } catch {
      setError(WRONG_ANSWER_MESSAGE);
      await logAccessAttempt(card.id, false);
    }
  }

  if (decryptedHtml !== null) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-12 space-y-6">
        <MessageCard childName={childName} htmlContent={decryptedHtml} cardId={card.id} />
        <ChildReplySection cardId={card.id} parentReplyLabel={parentReplyLabel} />
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-12">
      <Card className="border-amber-200/80 dark:border-amber-800/50 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            נמצא מסר עבור {childName || FALLBACK_CHILD_LABEL}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className="text-lg font-medium text-foreground mb-6 text-center"
            aria-label="שאלת אבטחה"
          >
            {card.security_question}
          </p>
          <form onSubmit={handleUnlock} className="space-y-4">
            {error && <ErrorMessage message={error} />}
            <label className="block text-sm font-medium text-right">
              התשובה שלך
              <Input
                type="password"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="••••••••"
                autoComplete="off"
                className="mt-2 text-right"
                aria-label="התשובה שלך"
              />
            </label>
            <Button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              פתח את המסר
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
