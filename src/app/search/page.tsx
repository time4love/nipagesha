"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { searchChild } from "./actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Heart } from "lucide-react";
import { toast } from "sonner";
import { CHILD_PAGE_GRADIENT } from "@/lib/constants";

const currentYear = new Date().getFullYear();
const birthYearOptions = Array.from(
  { length: currentYear - 1990 + 1 },
  (_, i) => currentYear - i
);

export default function SearchPage() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setPending(true);
    try {
      const result = await searchChild(formData);
      if (result.success) {
        router.push(result.redirectUrl);
        return;
      }
      toast.error(result.error);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen" dir="rtl">
      <div className={CHILD_PAGE_GRADIENT} aria-hidden />
      <div className="container mx-auto px-4 py-12 sm:py-20">
        <div className="mx-auto max-w-md">
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
        </div>
      </div>
    </div>
  );
}
