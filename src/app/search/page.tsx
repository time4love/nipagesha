"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { searchChild, type SearchMatch } from "./actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorMessage } from "@/components/ui/error-message";
import { Search, Heart, MessageCircle } from "lucide-react";
import { CHILD_PAGE_GRADIENT } from "@/lib/constants";

const currentYear = new Date().getFullYear();
const birthYearOptions = Array.from(
  { length: currentYear - 1990 + 1 },
  (_, i) => currentYear - i
);

const MULTIPLE_HEADLINE = "נמצאו מספר מסרים התואמים לשם זה";
const MESSAGE_FROM_LABEL = "מסר מאת:";
const IDENTITY_QUESTION_LABEL = "שאלת זיהוי:";
const THIS_IS_MY_MESSAGE_LABEL = "זה המסר שלי";
const SEARCH_AGAIN_LABEL = "חיפוש מחדש";

export default function SearchPage() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<SearchMatch[] | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setError(null);
    setMatches(null);
    setPending(true);
    try {
      const result = await searchChild(formData);
      if (result.success) {
        if (result.matches.length === 1) {
          router.push(`/message/${result.matches[0].id}`);
          return;
        }
        setMatches(result.matches);
        return;
      }
      setError(result.error);
    } finally {
      setPending(false);
    }
  }

  const showMultipleResults = matches && matches.length > 1;

  return (
    <div className="min-h-screen" dir="rtl">
      <div className={CHILD_PAGE_GRADIENT} aria-hidden />
      <div className="container mx-auto px-4 py-12 sm:py-20">
        <div className="mx-auto max-w-md">
          {showMultipleResults ? (
            <>
              <section
                className="text-center"
                aria-labelledby="multiple-messages-heading"
              >
                <div className="inline-flex size-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400 mb-4">
                  <Heart className="size-7" aria-hidden />
                </div>
                <h1
                  id="multiple-messages-heading"
                  className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl mb-6"
                >
                  {MULTIPLE_HEADLINE}
                </h1>
                <p className="text-muted-foreground mb-8">
                  בחר את המסר שלך לפי איך שאת/ה מכיר/ה את השולח.
                </p>
              </section>
              <ul className="space-y-4 mb-8" role="list">
                {matches!.map((match) => (
                  <li key={match.id}>
                    <Card className="border-amber-200/80 dark:border-amber-800/50 bg-card/80 shadow-md overflow-hidden">
                      <CardHeader className="pb-2">
                        <p className="font-semibold text-foreground text-lg">
                          {MESSAGE_FROM_LABEL} {match.sender_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">{IDENTITY_QUESTION_LABEL}</span>{" "}
                          {match.security_question}
                        </p>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Button
                          asChild
                          className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                          aria-label={`${THIS_IS_MY_MESSAGE_LABEL} - ${match.sender_name}`}
                        >
                          <Link href={`/message/${match.id}`}>
                            <MessageCircle className="size-4 ml-2 rtl:ml-0 rtl:mr-2" aria-hidden />
                            {THIS_IS_MY_MESSAGE_LABEL}
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
              <div className="text-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMatches(null)}
                  className="border-amber-300 dark:border-amber-700"
                  aria-label={SEARCH_AGAIN_LABEL}
                >
                  <Search className="size-4 ml-2 rtl:ml-0 rtl:mr-2" aria-hidden />
                  {SEARCH_AGAIN_LABEL}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-10">
                <div className="inline-flex size-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400 mb-4">
                  <Heart className="size-7" aria-hidden />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  האם השאירו לך מסר?
                </h1>
                <p className="mt-3 text-muted-foreground">
                  הזן את הפרטים שלך כדי לבדוק אם מחכה לך מסר.
                </p>
              </div>

              <Card className="border-amber-200/80 dark:border-amber-800/50 shadow-lg">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">חיפוש מסר</CardTitle>
                  <CardDescription>
                    שם פרטי, שם משפחה ושנת לידה — כמו שמופיעים בכרטיס.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {error && <ErrorMessage message={error} />}
                    <div className="space-y-2">
                      <Label htmlFor="firstName">שם פרטי</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="למשל דני"
                        required
                        autoComplete="given-name"
                        className="text-right"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">שם משפחה</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="למשל כהן"
                        required
                        autoComplete="family-name"
                        className="text-right"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthYear">שנת לידה</Label>
                      <select
                        id="birthYear"
                        name="birthYear"
                        required
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-right"
                      >
                        <option value="">בחר שנה</option>
                        {birthYearOptions.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button
                      type="submit"
                      disabled={pending}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                      aria-label="חפש מסר"
                    >
                      <Search className="size-4 ml-2 rtl:ml-0 rtl:mr-2" aria-hidden />
                      {pending ? "מחפש..." : "חפש מסר"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
