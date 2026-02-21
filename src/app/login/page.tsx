"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ErrorMessage } from "@/components/ui/error-message";

const AUTH_ERRORS: Record<string, string> = {
  "Invalid login credentials": "אימייל או סיסמה שגויים",
  "Email not confirmed": "נא לאשר את האימייל לפני ההתחברות",
};

function getErrorMessage(message: string): string {
  return AUTH_ERRORS[message] ?? message;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = !isSignUp || agreedToTerms;

  const supabase = createClient();

  useEffect(() => {
    const err = searchParams.get("error");
    if (err) setError(decodeURIComponent(err));
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp && !agreedToTerms) {
      setError("יש לאשר את תנאי השימוש ומדיניות הפרטיות כדי להמשיך");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        if (password.length < 6) {
          setError("הסיסמה חייבת להכיל לפחות 6 תווים");
          return;
        }
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) {
          setError(
            signUpError.message.includes("already registered")
              ? "כתובת האימייל כבר רשומה. נסו להתחבר."
              : getErrorMessage(signUpError.message)
          );
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          setError(getErrorMessage(signInError.message));
          return;
        }
      }

      router.refresh();
      router.push("/dashboard");
    } catch {
      setError("אירעה שגיאה בלתי צפויה");
    } finally {
      setIsLoading(false);
    }
  };

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
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
            {error && <ErrorMessage message={error} />}
            <div className="space-y-2">
              <Label htmlFor="auth-email">אימייל</Label>
              <Input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                required
                aria-required
                minLength={isSignUp ? 6 : undefined}
              />
              {isSignUp && (
                <p className="text-xs text-muted-foreground">לפחות 6 תווים</p>
              )}
            </div>
            {isSignUp && (
              <div className="flex items-start gap-3">
                <Checkbox
                  id="auth-terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) =>
                    setAgreedToTerms(checked === true)
                  }
                  aria-describedby="auth-terms-label"
                  aria-required
                />
                <Label
                  id="auth-terms-label"
                  htmlFor="auth-terms"
                  className="text-sm font-normal cursor-pointer leading-snug text-muted-foreground peer-disabled:cursor-not-allowed"
                >
                  קראתי ואני מסכים ל
                  <Link
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                  >
                    תנאי השימוש
                  </Link>
                  {" "}ול
                  <Link
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                  >
                    מדיניות הפרטיות
                  </Link>
                  .
                </Label>
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white sm:w-auto"
              disabled={isLoading || !canSubmit}
            >
              {isLoading ? (
                <>
                  <Loader2 className="me-2 h-4 w-4 animate-spin" aria-hidden />
                  {isSignUp ? "נרשם..." : "מתחבר..."}
                </>
              ) : (
                isSignUp ? "הירשם" : "התחבר"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row-reverse sm:justify-between">
          <button
            type="button"
            onClick={() => {
              setIsSignUp((v) => !v);
              if (!isSignUp) setAgreedToTerms(false);
              setError(null);
            }}
            className="text-sm text-teal-600 underline dark:text-teal-400 hover:no-underline"
          >
            {isSignUp ? "כבר יש לכם חשבון? התחברו" : "אין לכם חשבון? הירשמו"}
          </button>
          <Button type="button" variant="outline" asChild className="w-full sm:w-auto order-last sm:order-none">
            <Link href="/">ביטול</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          className="container mx-auto flex min-h-[80vh] items-center justify-center"
          aria-hidden
        />
      }
    >
      <LoginForm />
    </Suspense>
  );
}
