"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ErrorMessage } from "@/components/ui/error-message";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { hasHtmlContent } from "@/lib/child-card";
import { decryptMessage, encryptMessage } from "@/lib/crypto";
import { updateChildCard } from "@/app/(app)/create-card/actions";
import { getSignedUrl } from "@/app/(app)/view/actions";
import { toast } from "sonner";
import { Lock, Pencil } from "lucide-react";
import type { EditCardData } from "@/app/(app)/create-card/actions";

const WRONG_ANSWER_MESSAGE = "התשובה שגויה, לא ניתן לפענח את המסר";
const PRIVATE_PREFIX = "private://";
const currentYear = new Date().getFullYear();

/** Resolves img src="private://path" to signed URLs so the editor can display images. */
async function resolvePrivateImagesInHtml(html: string): Promise<string> {
  const pathRegex = /private:\/\/([^"'\s]+)/g;
  const paths = Array.from(new Set([...html.matchAll(pathRegex)].map((m) => m[1])));
  if (paths.length === 0) return html;
  const results = await Promise.all(paths.map((path) => getSignedUrl(path)));
  let result = html;
  paths.forEach((path, i) => {
    const url = results[i]?.url;
    if (path && url) result = result.replaceAll(`${PRIVATE_PREFIX}${path}`, url);
  });
  return result;
}
const birthYearOptions = Array.from({ length: 30 }, (_, i) => currentYear - 5 - i);

function htmlWithPrivateImagePaths(html: string): string {
  return html.replace(
    /src="([^"]*\/sign\/secure-media\/([^"?]+)[^"]*)"/g,
    'src="private://$2"'
  );
}

const editCardSchema = z.object({
  child_first_name: z.string().min(1, "נא להזין שם פרטי"),
  child_last_name: z.string().min(1, "נא להזין שם משפחה"),
  birth_year: z.coerce.number().min(1950).max(currentYear),
  security_question: z.string().min(1, "נא להזין שאלת אבטחה"),
  security_answer: z.string().min(1, "נא להזין תשובה לסוד"),
  message: z
    .string()
    .min(1, "נא להזין את המסר")
    .refine(hasHtmlContent, "נא להזין את המסר"),
});

type EditCardFormValues = z.infer<typeof editCardSchema>;

interface EditCardClientProps {
  card: EditCardData;
}

function EditForm({
  card,
  decryptedHtml,
  unlockAnswer,
}: {
  card: EditCardData;
  decryptedHtml: string;
  unlockAnswer: string;
}) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<EditCardFormValues>({
    resolver: zodResolver(editCardSchema),
    defaultValues: {
      child_first_name: card.child_first_name,
      child_last_name: card.child_last_name,
      birth_year: card.birth_year,
      security_question: card.security_question,
      security_answer: unlockAnswer,
      message: decryptedHtml,
    },
  });

  async function onSubmit(values: EditCardFormValues) {
    setSubmitError(null);
    try {
      const htmlToEncrypt = htmlWithPrivateImagePaths(values.message);
      const encryptedMessage = await encryptMessage(
        htmlToEncrypt,
        values.security_answer
      );
      const result = await updateChildCard(card.id, {
        child_first_name: values.child_first_name,
        child_last_name: values.child_last_name,
        birth_year: values.birth_year,
        security_question: values.security_question,
        encrypted_message: encryptedMessage,
      });
      if (result?.error) {
        setSubmitError(result.error);
      } else {
        toast.success("הכרטיס נשמר בהצלחה.");
        router.push("/dashboard");
      }
    } catch {
      setSubmitError("שגיאה בהצפנה או בשליחה. נסו שוב.");
    }
  }

  return (
    <div className="container max-w-2xl mx-auto py-8" dir="rtl">
      <Card className="border-teal-200 dark:border-teal-800 transition-shadow">
        <CardHeader className="text-right">
          <div className="flex items-center gap-2">
            <Pencil className="size-5 text-teal-600 dark:text-teal-400" aria-hidden />
            <CardTitle className="text-2xl">עריכת כרטיס</CardTitle>
          </div>
          <CardDescription>
            ערכו את פרטי הכרטיס והמסר. המסר יוצפן מחדש עם תשובת האבטחה לפני השמירה.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
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
                        placeholder="כתבו כאן את המסר. הוא יוצפן לפני שמירה."
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
                {form.formState.isSubmitting ? "שומר..." : "שמור שינויים"}
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

export function EditCardClient({ card }: EditCardClientProps) {
  const [unlockAnswer, setUnlockAnswer] = useState("");
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [decryptedHtml, setDecryptedHtml] = useState<string | null>(null);

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    setUnlockError(null);
    const answer = unlockAnswer.trim();
    if (!answer) return;
    setIsUnlocking(true);
    try {
      const html = await decryptMessage(card.encrypted_message, answer);
      const htmlWithResolvedImages = await resolvePrivateImagesInHtml(html);
      setDecryptedHtml(htmlWithResolvedImages);
    } catch {
      setUnlockError(WRONG_ANSWER_MESSAGE);
    } finally {
      setIsUnlocking(false);
    }
  }

  if (decryptedHtml === null) {
    return (
      <div className="container max-w-2xl mx-auto py-8" dir="rtl">
        <Card className="border-amber-200/80 dark:border-amber-800/50 shadow-lg transition-shadow">
          <CardHeader className="text-right">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 mb-2">
              <Lock className="size-6" aria-hidden />
            </div>
            <CardTitle className="text-xl text-center">עריכת כרטיס</CardTitle>
            <CardDescription className="text-center">
              כדי לערוך את המסר, יש להזין את תשובת האבטחה הנוכחית.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUnlock} className="space-y-4">
              {unlockError && <ErrorMessage message={unlockError} />}
              <label className="block text-sm font-medium text-right">
                תשובת האבטחה
                <Input
                  type="password"
                  value={unlockAnswer}
                  onChange={(e) => setUnlockAnswer(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="off"
                  className="mt-2 text-right"
                  aria-label="תשובת האבטחה"
                  disabled={isUnlocking}
                />
              </label>
              <Button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                disabled={isUnlocking}
              >
                {isUnlocking ? "מפענח..." : "פענח וערוך"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <EditForm
      card={card}
      decryptedHtml={decryptedHtml}
      unlockAnswer={unlockAnswer.trim()}
    />
  );
}
