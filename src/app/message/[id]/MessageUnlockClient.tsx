"use client";

import { useState } from "react";
import { decryptMessage } from "@/lib/crypto";
import { MessageCard } from "@/components/message/MessageCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorMessage } from "@/components/ui/error-message";
import type { MessagePageCard } from "./page";

const WRONG_ANSWER_MESSAGE = "התשובה אינה נכונה, נסה שוב";

export function MessageUnlockClient({ card }: { card: MessagePageCard }) {
  const [answer, setAnswer] = useState("");
  const [decryptedHtml, setDecryptedHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const childName = [card.child_first_name, card.child_last_name].filter(Boolean).join(" ").trim();

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const html = await decryptMessage(card.encrypted_message, answer.trim());
      setDecryptedHtml(html);
    } catch {
      setError(WRONG_ANSWER_MESSAGE);
    }
  }

  if (decryptedHtml !== null) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-12">
        <MessageCard childName={childName} htmlContent={decryptedHtml} />
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-12">
      <Card className="border-amber-200/80 dark:border-amber-800/50 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            נמצא מסר עבור {childName || "הילד"}
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
