import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Search } from "lucide-react";

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-xl text-center">
        <Card className="border-teal-200 dark:border-teal-800">
          <CardHeader>
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400 mb-2">
              <Search className="size-6" aria-hidden />
            </div>
            <CardTitle className="text-2xl">חיפוש מסר</CardTitle>
            <CardDescription>
              כאן תוכל לחפש את שמך ולגלות אם יש עבורך מסר. הפונקציונליות תתווסף בהמשך.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white">
              <Link href="/">חזרה לדף הבית</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
