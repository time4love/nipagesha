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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ErrorMessage } from "@/components/ui/error-message";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { MessageCard } from "@/components/message/MessageCard";
import { encryptMessage } from "@/lib/crypto";
import { createChildCard } from "./actions";
import { toast } from "sonner";
import { Eye } from "lucide-react";

/** Replaces signed img URLs with private:// paths so we store paths, not temporary URLs. */
function htmlWithPrivateImagePaths(html: string): string {
  return html.replace(
    /src="([^"]*\/sign\/secure-media\/([^"?]+)[^"]*)"/g,
    'src="private://$2"'
  );
}

const currentYear = new Date().getFullYear();
const birthYearOptions = Array.from({ length: 30 }, (_, i) => currentYear - 5 - i);

const createCardSchema = z.object({
  child_first_name: z.string().min(1, "נא להזין שם פרטי"),
  child_last_name: z.string().min(1, "נא להזין שם משפחה"),
  birth_year: z.coerce.number().min(1950).max(currentYear),
  security_question: z.string().min(1, "נא להזין שאלת אבטחה"),
  security_answer: z.string().min(1, "נא להזין תשובה לסוד"),
  message: z
    .string()
    .min(1, "נא להזין את המסר")
    .refine(
      (html) => html.replace(/<[^>]*>/g, "").trim().length > 0,
      "נא להזין את המסר"
    ),
});

type CreateCardFormValues = z.infer<typeof createCardSchema>;

export default function CreateCardPage() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

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
      const htmlToEncrypt = htmlWithPrivateImagePaths(values.message);
      const encryptedMessage = await encryptMessage(
        htmlToEncrypt,
        values.security_answer
      );
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
              {submitError && <ErrorMessage message={submitError} />}
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
                      <RichTextEditor
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="כתבו כאן את המסר. הוא יוצפן לפני שליחה."
                        onUploadError={(msg) => toast.error(msg)}
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
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => setPreviewOpen(true)}
                aria-label="תצוגה מקדימה"
              >
                <Eye className="size-4 ml-2 rtl:ml-0 rtl:mr-2" aria-hidden />
                תצוגה מקדימה
              </Button>
              <Button type="button" variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/dashboard">ביטול</Link>
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen} dir="rtl">
        <DialogContent
          className="max-w-2xl w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto"
          showClose={true}
        >
          <DialogHeader className="text-right">
            <DialogTitle>תצוגה מקדימה</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <PreviewContent form={form} />
          </div>
          <DialogFooter className="sm:justify-start flex-row-reverse">
            <Button type="button" variant="outline" onClick={() => setPreviewOpen(false)}>
              סגור תצוגה מקדימה
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PreviewContent({ form }: { form: ReturnType<typeof useForm<CreateCardFormValues>> }) {
  const firstName = form.watch("child_first_name") ?? "";
  const lastName = form.watch("child_last_name") ?? "";
  const htmlContent = form.watch("message") ?? "";
  const childName = [firstName, lastName].filter(Boolean).join(" ").trim();

  const hasContent = htmlContent.replace(/<[^>]*>/g, "").trim().length > 0;
  if (!hasContent) {
    return (
      <p className="text-muted-foreground text-sm text-right py-8">
        הוסיפו מסר בשדה &quot;המסר לילד&quot; כדי לראות תצוגה מקדימה.
      </p>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto">
      <MessageCard
        childName={childName}
        htmlContent={htmlContent}
        isPreview
      />
    </div>
  );
}
