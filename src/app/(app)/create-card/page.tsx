"use client";

import { useState } from "react";
import Link from "next/link";
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
import { formatChildName, hasHtmlContent } from "@/lib/child-card";
import { encryptMessage } from "@/lib/crypto";
import { createChildCard } from "./actions";
import { toast } from "sonner";
import { Eye } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

const currentYear = new Date().getFullYear();

const createCardSchema = z.object({
  child_first_name: z.string().min(1, "validation.childFirstName.required"),
  child_last_name: z.string().min(1, "validation.childLastName.required"),
  birth_year: z
    .coerce
    .number()
    .min(1950, "validation.birthYear.range")
    .max(currentYear, "validation.birthYear.range"),
  sender_name: z.string().min(1, "validation.senderName.required"),
  security_question: z.string().min(1, "validation.securityQuestion.required"),
  security_answer: z.string().min(1, "validation.securityAnswer.required"),
  message: z
    .string()
    .min(1, "validation.message.required")
    .refine(hasHtmlContent, "validation.message.hasContent"),
});

/** Replaces signed img URLs with private:// paths so we store paths, not temporary URLs. */
function htmlWithPrivateImagePaths(html: string): string {
  return html.replace(
    /src="([^"]*\/sign\/secure-media\/([^"?]+)[^"]*)"/g,
    'src="private://$2"'
  );
}

const birthYearOptions = Array.from({ length: 30 }, (_, i) => currentYear - 5 - i);

type CreateCardFormValues = z.infer<typeof createCardSchema>;

export default function CreateCardPage() {
  const { t } = useTranslation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const form = useForm<CreateCardFormValues>({
    resolver: zodResolver(createCardSchema),
    defaultValues: {
      child_first_name: "",
      child_last_name: "",
      birth_year: currentYear - 10,
      sender_name: "הורה",
      security_question: "",
      security_answer: "",
      message: "",
    },
  });

  function translateError(message: string | undefined): string {
    if (!message) return "";
    if (message === "validation.birthYear.range") {
      return t(message, { min: 1950, max: currentYear });
    }
    return t(message);
  }

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
        sender_name: values.sender_name,
        security_question: values.security_question,
        encrypted_message: encryptedMessage,
      });
      if (result?.error) {
        setSubmitError(result.error);
      }
    } catch {
      setSubmitError(t("createCard.encryptionError"));
    }
  }

  function onInvalid() {
    const count = Object.keys(form.formState.errors).length;
    toast.error(t("validationToast", { count }));
  }

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card className="border-teal-200 dark:border-teal-800">
        <CardHeader className="text-right">
          <CardTitle className="text-2xl">{t("createCard.title")}</CardTitle>
          <CardDescription>{t("createCard.description")}</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onInvalid)}
            dir="rtl"
          >
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
                name="sender_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("createCard.senderNameLabel")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("createCard.senderNamePlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.sender_name?.message &&
                        translateError(form.formState.errors.sender_name.message)}
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
                {form.formState.isSubmitting ? t("createCard.submitting") : t("createCard.submit")}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => setPreviewOpen(true)}
                aria-label={t("createCard.previewAria")}
              >
                <Eye className="size-4 ml-2 rtl:ml-0 rtl:mr-2" aria-hidden />
                {t("createCard.preview")}
              </Button>
              <Button type="button" variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/dashboard">{t("common.cancel")}</Link>
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent
          className="max-w-2xl w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto"
          showClose={true}
        >
          <DialogHeader className="text-right">
            <DialogTitle>{t("createCard.previewTitle")}</DialogTitle>
          </DialogHeader>
          <div className="py-4" dir="rtl">
            <PreviewContent form={form} />
          </div>
          <DialogFooter className="sm:justify-start flex-row-reverse">
            <Button type="button" variant="outline" onClick={() => setPreviewOpen(false)}>
              {t("createCard.closePreview")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PreviewContent({ form }: { form: UseFormReturn<CreateCardFormValues> }) {
  const { t } = useTranslation();
  const firstName = form.watch("child_first_name") ?? "";
  const lastName = form.watch("child_last_name") ?? "";
  const htmlContent = form.watch("message") ?? "";
  const childName = formatChildName(firstName, lastName);

  if (!hasHtmlContent(htmlContent)) {
    return (
      <p className="text-muted-foreground text-sm text-right py-8">
        {t("createCard.previewEmptyHint")}
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
