"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { encryptMessage } from "@/lib/crypto";
import { createChildCard } from "./actions";

const currentYear = new Date().getFullYear();
const birthYearOptions = Array.from({ length: 30 }, (_, i) => currentYear - 5 - i);

const createCardSchema = z.object({
  child_first_name: z.string().min(1, "נא להזין שם פרטי"),
  child_last_name: z.string().min(1, "נא להזין שם משפחה"),
  birth_year: z.coerce.number().min(1950).max(currentYear),
  security_question: z.string().min(1, "נא להזין שאלת אבטחה"),
  security_answer: z.string().min(1, "נא להזין תשובה לסוד"),
  message: z.string().min(1, "נא להזין את המסר"),
});

type CreateCardFormValues = z.infer<typeof createCardSchema>;

export default function CreateCardPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<CreateCardFormValues>({
    resolver: zodResolver(createCardSchema),
    defaultValues: {
      child_first_name: "",
      child_last_name: "",
      birth_year: currentYear - 10,
      security_question: "",
      security_answer: "",
      message: "",
    },
  });

  async function onSubmit(values: CreateCardFormValues) {
    setSubmitError(null);
    try {
      const encryptedMessage = await encryptMessage(values.message, values.security_answer);
      const result = await createChildCard({
        child_first_name: values.child_first_name,
        child_last_name: values.child_last_name,
        birth_year: values.birth_year,
        security_question: values.security_question,
        encrypted_message: encryptedMessage,
      });
      if (result?.error) {
        setSubmitError(result.error);
      }
    } catch (err) {
      setSubmitError("שגיאה בהצפנה או בשליחה. נסו שוב.");
    }
  }

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card className="border-teal-200 dark:border-teal-800">
        <CardHeader className="text-right">
          <CardTitle className="text-2xl">יצירת כרטיס ילד</CardTitle>
          <CardDescription>
            המסר והתשובה לסוד מוצפנים בדפדפן — השרת לא רואה אותם. רק הילד יוכל לפתוח את המסר עם התשובה הנכונה.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} dir="rtl">
            <CardContent className="space-y-6">
              {submitError && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-md p-3" role="alert">
                  {submitError}
                </p>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="child_first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>שם פרטי של הילד</FormLabel>
                      <FormControl>
                        <Input placeholder="למשל דני" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="child_last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>שם משפחה של הילד</FormLabel>
                      <FormControl>
                        <Input placeholder="למשל כהן" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="birth_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>שנת לידה</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        {...field}
                        value={String(field.value)}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      >
                        {birthYearOptions.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="security_question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>שאלת אבטחה (רק הילד יודע את התשובה)</FormLabel>
                    <FormControl>
                      <Input placeholder="למשל: מה היה שם הכלב הראשון שלנו?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="security_answer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>תשובה לסוד (משמשת כמפתח הצפנה — אל תשתפו)</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>המסר לילד</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="כתבו כאן את המסר. הוא יוצפן לפני שליחה."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-3 sm:flex-row-reverse sm:justify-start">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white"
              >
                {form.formState.isSubmitting ? "שומר..." : "שמור כרטיס"}
              </Button>
              <Button type="button" variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/dashboard">ביטול</Link>
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
