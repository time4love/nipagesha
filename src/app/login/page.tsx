"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorMessage } from "@/components/ui/error-message";

function LoginForm() {
  const searchParams = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err) setError(decodeURIComponent(err));
  }, [searchParams]);

  function getAction() {
    return isSignUp ? "/api/auth/signup" : "/auth/login";
  }

  return (
    <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-teal-200 dark:border-teal-800">
        <CardHeader className="text-center sm:text-right">
          <CardTitle className="text-2xl">
            {isSignUp ? "הרשמה" : "התחברות"}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? "צרו חשבון כדי ליצור כרטיסי ילד ולשלוח מסרים מאובטחים"
              : "הכנס אימייל וסיסמה כדי להתחבר לחשבון שלך"}
          </CardDescription>
        </CardHeader>
        <form action={getAction()} method="post" className="space-y-4">
          <CardContent className="space-y-4" dir="rtl">
            {error && <ErrorMessage message={error} />}
            <div className="space-y-2">
              <Label htmlFor="auth-email">אימייל</Label>
              <Input
                id="auth-email"
                name="email"
                type="email"
                placeholder="your@email.com"
                autoComplete="email"
                required
                aria-required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="auth-password">סיסמה</Label>
              <Input
                id="auth-password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                required
                aria-required
                minLength={isSignUp ? 6 : undefined}
              />
              {isSignUp && (
                <p className="text-xs text-muted-foreground">
                  לפחות 6 תווים
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 sm:flex-row-reverse sm:justify-between">
            <Button
              type="submit"
              className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white"
            >
              {isSignUp ? "הירשם" : "התחבר"}
            </Button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp((v) => !v);
                setError(null);
              }}
              className="text-sm text-teal-600 dark:text-teal-400 hover:underline"
            >
              {isSignUp ? "כבר יש לכם חשבון? התחברו" : "אין לכם חשבון? הירשמו"}
            </button>
            <Button type="button" variant="outline" asChild className="w-full sm:w-auto order-last sm:order-none">
              <Link href="/">ביטול</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container mx-auto flex min-h-[80vh] items-center justify-center" aria-hidden />}>
      <LoginForm />
    </Suspense>
  );
}
