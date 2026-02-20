"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
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
  child_first_name: z.string().min(1, "validation.childFirstName.required"),
  child_last_name: z.string().min(1, "validation.childLastName.required"),
  birth_year: z
    .coerce
    .number()
    .min(1950, "validation.birthYear.range")
    .max(currentYear, "validation.birthYear.range"),
  security_question: z.string().min(1, "validation.securityQuestion.required"),
  security_answer: z.string().min(1, "validation.securityAnswer.required"),
  message: z
    .string()
    .min(1, "validation.message.required")
    .refine(hasHtmlContent, "validation.message.hasContent"),
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
  const { t } = useTranslation();
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

  function translateError(message: string | undefined): string {
    if (!message) return "";
    if (message === "validation.birthYear.range") {
      return t(message, { min: 1950, max: currentYear });
    }
    return t(message);
  }

  function onInvalid() {
    const count = Object.keys(form.formState.errors).length;
    toast.error(t("validationToast", { count }));
  }

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
        toast.success(t("editCard.saveSuccess"));
        router.push("/dashboard");
      }
    } catch {
      setSubmitError(t("editCard.encryptionError"));
    }
  }

  return (
    <div className="container max-w-2xl mx-auto py-8" dir="rtl">
      <Card className="border-teal-200 dark:border-teal-800 transition-shadow">
        <CardHeader className="text-right">
          <div className="flex items-center gap-2">
            <Pencil className="size-5 text-teal-600 dark:text-teal-400" aria-hidden />
            <CardTitle className="text-2xl">{t("editCard.title")}</CardTitle>
          </div>
          <CardDescription>{t("editCard.description")}</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
            <CardContent className="space-y-6">
              {submitError && <ErrorMessage message={submitError} />}
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="child_first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("createCard.childFirstNameLabel")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("createCard.childFirstNamePlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage>
                        {form.formState.errors.child_first_name?.message &&
                          translateError(form.formState.errors.child_first_name.message)}
                      </FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="child_last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("createCard.childLastNameLabel")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("createCard.childLastNamePlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage>
                        {form.formState.errors.child_last_name?.message &&
                          translateError(form.formState.errors.child_last_name.message)}
                      </FormMessage>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="birth_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("createCard.birthYearLabel")}</FormLabel>
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
                    <FormMessage>
                      {form.formState.errors.birth_year?.message &&
                        translateError(form.formState.errors.birth_year.message)}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="security_question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("createCard.securityQuestionLabel")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("createCard.securityQuestionPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.security_question?.message &&
                        translateError(form.formState.errors.security_question.message)}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="security_answer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("createCard.securityAnswerLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t("createCard.securityAnswerPlaceholder")}
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.security_answer?.message &&
                        translateError(form.formState.errors.security_answer.message)}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("createCard.messageLabel")}</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value}
                        onChange={field.onChange}
                        mode="private"
                        placeholder={t("createCard.messagePlaceholder")}
                        onUploadError={(msg) => toast.error(msg)}
                      />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.message?.message &&
                        translateError(form.formState.errors.message.message)}
                    </FormMessage>
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
                {form.formState.isSubmitting ? t("editCard.submitting") : t("editCard.submit")}
              </Button>
              <Button type="button" variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/dashboard">{t("common.cancel")}</Link>
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}

export function EditCardClient({ card }: EditCardClientProps) {
  const { t } = useTranslation();
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
      setUnlockError(t("editCard.wrongAnswer"));
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
            <CardTitle className="text-xl text-center">{t("editCard.unlockTitle")}</CardTitle>
            <CardDescription className="text-center">
              {t("editCard.unlockDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUnlock} className="space-y-4">
              {unlockError && <ErrorMessage message={unlockError} />}
              <label className="block text-sm font-medium text-right">
                {t("editCard.securityAnswerLabel")}
                <Input
                  type="password"
                  value={unlockAnswer}
                  onChange={(e) => setUnlockAnswer(e.target.value)}
                  placeholder={t("createCard.securityAnswerPlaceholder")}
                  autoComplete="off"
                  className="mt-2 text-right"
                  aria-label={t("editCard.securityAnswerLabel")}
                  disabled={isUnlocking}
                />
              </label>
              <Button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                disabled={isUnlocking}
              >
                {isUnlocking ? t("editCard.unlocking") : t("editCard.unlockSubmit")}
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
