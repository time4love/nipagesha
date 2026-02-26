"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

/** Google "G" logo SVG for the sign-in button (RTL-safe). */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
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
  const searchParams = useSearchParams();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [formRevealed, setFormRevealed] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = !isSignUp || agreedToTerms;
  const redirectTo = searchParams.get("redirect") || "";

  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const callbackUrl = redirectTo
        ? `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`
        : `${origin}/auth/callback`;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callbackUrl },
      });
      if (oauthError) {
        setError(getErrorMessage(oauthError.message));
        return;
      }
    } catch {
      setError("אירעה שגיאה בלתי צפויה");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  useEffect(() => {
    const err = searchParams.get("error");
    if (err) setError(decodeURIComponent(err));
  }, [searchParams]);

  // Trigger slide-down animation when email form is first shown
  useEffect(() => {
    if (!showEmailForm) {
      setFormRevealed(false);
      return;
    }
    const frame = requestAnimationFrame(() => {
      setFormRevealed(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [showEmailForm]);

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

      const destination = redirectTo && redirectTo.startsWith("/") ? redirectTo : "/dashboard";
      window.location.href = destination;
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
            {!showEmailForm
              ? "התחברו או הירשמו כדי להמשיך"
              : isSignUp
                ? "צרו חשבון כדי ליצור כרטיסי ילד, לבקש או להציע עזרה."
                : "הכנס אימייל וסיסמה כדי להתחבר לחשבון שלך"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4" dir="rtl">
          {error && <ErrorMessage message={error} />}

          {/* Top: Google sign-in (always visible, prominent) */}
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="w-full border-neutral-300 bg-white hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-base"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
            aria-label="המשך עם Google"
          >
            {isGoogleLoading ? (
              <Loader2 className="me-2 h-5 w-5 animate-spin" aria-hidden />
            ) : (
              <GoogleIcon className="me-2 h-5 w-5 shrink-0" />
            )}
            המשך עם Google
          </Button>

          {/* Middle: Progressive disclosure — link or email form */}
          {!showEmailForm ? (
            <div className="flex justify-center pt-1">
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground text-sm font-normal underline-offset-4 hover:underline"
                onClick={() => setShowEmailForm(true)}
                aria-expanded="false"
                aria-controls="email-auth-form"
              >
                אני מעדיף להמשיך עם אימייל וסיסמה
              </Button>
            </div>
          ) : (
            <div
              id="email-auth-form"
              className="overflow-hidden transition-[max-height] duration-300 ease-out"
              style={{ maxHeight: formRevealed ? 600 : 0 }}
              aria-expanded="true"
            >
              <div className="space-y-4 pt-2">
                  <div className="relative flex items-center gap-3">
                    <span className="absolute inset-0 flex items-center" aria-hidden>
                      <span className="w-full border-t border-border" />
                    </span>
                    <span className="relative px-2 text-xs text-muted-foreground bg-card">
                      או
                    </span>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
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
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row-reverse sm:justify-between">
          {showEmailForm ? (
            <>
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
            </>
          ) : (
            <Button type="button" variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/">ביטול</Link>
            </Button>
          )}
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
