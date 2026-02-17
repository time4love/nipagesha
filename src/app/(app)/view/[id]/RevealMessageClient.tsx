"use client";

import { useState } from "react";
import Link from "next/link";
import { decryptMessage } from "@/lib/crypto";
import { MessageCard } from "@/components/message/MessageCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorMessage } from "@/components/ui/error-message";

interface RevealMessageClientProps {
  securityQuestion: string;
  encryptedMessage: string;
  childName?: string;
}

export function RevealMessageClient({
  securityQuestion,
  encryptedMessage,
  childName = "",
}: RevealMessageClientProps) {
  const [answer, setAnswer] = useState("");
  const [decryptedHtml, setDecryptedHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleReveal(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const html = await decryptMessage(encryptedMessage, answer.trim());
      setDecryptedHtml(html);
    } catch {
      setError("תשובה שגויה או בעיה בפענוח. נסו שוב.");
    }
  }

  if (decryptedHtml !== null) {
    return (
      <div className="container max-w-2xl mx-auto py-8" dir="rtl">
        <MessageCard childName={childName} htmlContent={decryptedHtml} />
        <Button variant="outline" asChild className="mt-4">
          <Link href="/dashboard">חזרה ללוח הבקרה</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-8" dir="rtl">
      <Card className="border-teal-200 dark:border-teal-800">
        <CardHeader>
          <CardTitle className="text-xl">צפייה במסר</CardTitle>
          <p className="text-muted-foreground text-sm">{securityQuestion}</p>
        </CardHeader>
        <form onSubmit={handleReveal}>
          <CardContent className="space-y-4">
            {error && <ErrorMessage message={error} />}
            <label className="block text-sm font-medium">
              התשובה
              <Input
                type="password"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="••••••••"
                autoComplete="off"
                className="mt-2"
              />
            </label>
            <Button type="submit" className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white">
              הצג מסר
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
