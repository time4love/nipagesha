"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import dynamic from "next/dynamic";
import Image from "next/image";
import { upsertArticleWithFormData } from "../actions";
import type { AdminArticle } from "../actions";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, ImageIcon, Link2, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const RichTextEditor = dynamic(
  () =>
    import("@/components/editor/RichTextEditor").then((m) => m.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="min-h-[220px] w-full rounded-md" aria-hidden />
    ),
  }
);

const articleSchema = z
  .object({
    title: z.string().min(1, "כותרת חובה"),
    content: z.string().optional(),
    media_type: z.enum(["video", "image", "link"]),
    media_url: z.string().optional(),
    link_thumbnail: z.string().optional(),
    is_published: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const url = data.media_url?.trim() ?? "";
    if (data.media_type === "video" && !url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "קישור יוטיוב חובה",
        path: ["media_url"],
      });
    }
    if (data.media_type === "link" && !url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "נא להזין כתובת URL של הכתבה או הסרטון",
        path: ["media_url"],
      });
    }
    if (data.media_type === "link" && url) {
      try {
        const u = new URL(url);
        if (u.protocol !== "http:" && u.protocol !== "https:") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "הקישור חייב להתחיל ב-https:// או http://",
            path: ["media_url"],
          });
        }
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "כתובת URL לא תקינה",
          path: ["media_url"],
        });
      }
    }
    const thumb = data.link_thumbnail?.trim() ?? "";
    if (data.media_type === "link" && thumb) {
      try {
        const u = new URL(thumb);
        if (u.protocol !== "http:" && u.protocol !== "https:") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "כתובת תמונה חייבת להתחיל ב-https:// או http://",
            path: ["link_thumbnail"],
          });
        }
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "כתובת תמונה לא תקינה",
          path: ["link_thumbnail"],
        });
      }
    }
  });

type ArticleFormValues = z.infer<typeof articleSchema>;

interface ArticleFormProps {
  initialArticle: AdminArticle | null;
  isNew: boolean;
}

export function ArticleForm({ initialArticle, isNew }: ArticleFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(
    initialArticle?.media_type === "image" ? initialArticle.media_url : null
  );
  const [linkThumbFile, setLinkThumbFile] = useState<File | null>(null);
  const [linkThumbPreviewUrl, setLinkThumbPreviewUrl] = useState<string | null>(
    initialArticle?.media_type === "link" && initialArticle.link_thumbnail
      ? initialArticle.link_thumbnail
      : null
  );
  const [dragActive, setDragActive] = useState(false);

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: initialArticle?.title ?? "",
      content: initialArticle?.content ?? "",
      media_type: initialArticle?.media_type ?? "video",
      media_url: initialArticle?.media_url ?? "",
      link_thumbnail: initialArticle?.link_thumbnail ?? "",
      is_published: initialArticle?.is_published ?? true,
    },
  });

  const mediaType = form.watch("media_type");

  const handleImageChange = useCallback((file: File | null) => {
    setImagePreviewUrl((prevUrl) => {
      if (prevUrl?.startsWith("blob:")) URL.revokeObjectURL(prevUrl);
      return file ? URL.createObjectURL(file) : null;
    });
    setImageFile(file ?? null);
  }, []);

  const handleLinkThumbChange = useCallback((file: File | null) => {
    setLinkThumbPreviewUrl((prevUrl) => {
      if (prevUrl?.startsWith("blob:")) URL.revokeObjectURL(prevUrl);
      return file ? URL.createObjectURL(file) : null;
    });
    setLinkThumbFile(file ?? null);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const f = e.dataTransfer.files?.[0];
      if (f?.type.startsWith("image/")) handleImageChange(f);
    },
    [handleImageChange]
  );
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);
  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  function onSubmit(values: ArticleFormValues) {
    const formData = new FormData();
    formData.set("title", values.title);
    formData.set("content", values.content ?? "");
    formData.set("media_type", values.media_type);
    formData.set("media_url", values.media_url ?? "");
    formData.set("is_published", String(values.is_published));
    if (!isNew && initialArticle?.id) formData.set("id", initialArticle.id);
    if (values.media_type === "image" && imageFile) {
      formData.set("media_file", imageFile);
    }
    if (values.media_type === "link") {
      formData.set("link_thumbnail", values.link_thumbnail?.trim() ?? "");
      if (linkThumbFile) {
        formData.set("link_thumbnail_file", linkThumbFile);
      }
    }

    startTransition(async () => {
      const result = await upsertArticleWithFormData(formData);
      if (result.error) {
        form.setError("root", { message: result.error });
        return;
      }
      router.push("/admin/articles");
      router.refresh();
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        dir="rtl"
      >
        {form.formState.errors.root && (
          <div
            className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive"
            role="alert"
                   >
            {form.formState.errors.root.message}
          </div>
        )}

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>כותרת *</FormLabel>
              <FormControl>
                <Input placeholder="כותרת" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>תוכן</FormLabel>
              <FormControl>
                <RichTextEditor
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  mode="public"
                  placeholder="כתבו כאן את התוכן. כותרות, רשימות, תמונות ויישור."
                  onUploadError={(msg) => toast.error(msg)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Media type: Video vs Image */}
        <div className="space-y-3">
          <Label>סוג מדיה</Label>
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="media_type"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <input
                      type="radio"
                      id="media_video"
                      value="video"
                      checked={field.value === "video"}
                      onChange={() => {
                        field.onChange("video");
                        handleLinkThumbChange(null);
                      }}
                      className="h-4 w-4 border-input"
                      aria-describedby="media_video_desc"
                    />
                  </FormControl>
                  <FormLabel
                    htmlFor="media_video"
                    className="flex items-center gap-2 cursor-pointer font-normal"
                    id="media_video_desc"
                  >
                    <Video className="size-4" aria-hidden />
                    וידאו (יוטיוב)
                  </FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="media_type"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <input
                      type="radio"
                      id="media_image"
                      value="image"
                      checked={field.value === "image"}
                      onChange={() => {
                        field.onChange("image");
                        handleImageChange(null);
                        handleLinkThumbChange(null);
                      }}
                      className="h-4 w-4 border-input"
                      aria-describedby="media_image_desc"
                    />
                  </FormControl>
                  <FormLabel
                    htmlFor="media_image"
                    className="flex items-center gap-2 cursor-pointer font-normal"
                    id="media_image_desc"
                  >
                    <ImageIcon className="size-4" aria-hidden />
                    תמונה (העלאה)
                  </FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="media_type"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <input
                      type="radio"
                      id="media_link"
                      value="link"
                      checked={field.value === "link"}
                      onChange={() => {
                        field.onChange("link");
                        handleImageChange(null);
                        handleLinkThumbChange(null);
                      }}
                      className="h-4 w-4 border-input"
                      aria-describedby="media_link_desc"
                    />
                  </FormControl>
                  <FormLabel
                    htmlFor="media_link"
                    className="flex items-center gap-2 cursor-pointer font-normal"
                    id="media_link_desc"
                  >
                    <Link2 className="size-4" aria-hidden />
                    קישור חיצוני (כתבה/VOD)
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>
        </div>

        {mediaType === "video" && (
          <FormField
            control={form.control}
            name="media_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>קישור יוטיוב *</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {mediaType === "image" && (
          <div className="space-y-2">
            <Label>תמונת ראשית</Label>
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              className={cn(
                "rounded-md border-2 border-dashed p-6 text-center transition-colors",
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-input bg-muted/30"
              )}
            >
              <input
                type="file"
                id="article_image"
                accept="image/*"
                className="sr-only"
                onChange={(e) =>
                  handleImageChange(e.target.files?.[0] ?? null)
                }
                aria-label="העלאת תמונה"
              />
              <label
                htmlFor="article_image"
                className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
              >
                גרור תמונה לכאן או לחץ לבחירה
              </label>
            </div>
            {(imagePreviewUrl || (initialArticle?.media_type === "image" && initialArticle?.media_url && !imageFile)) && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground mb-2">
                  תצוגה מקדימה
                </p>
                <Image
                  src={imagePreviewUrl ?? initialArticle!.media_url}
                  alt="תצוגה מקדימה"
                  width={640}
                  height={360}
                  unoptimized
                  className="h-40 w-auto max-w-full rounded-md border object-cover"
                />
              </div>
            )}
          </div>
        )}

        {mediaType === "link" && (
          <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
            <p className="text-sm text-muted-foreground">
              מתאים לכתבות או סרטונים באתרי ערוצים שלא מאפשרים הטמעה (iframe).
            </p>
            <FormField
              control={form.control}
              name="media_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>קישור לכתבה / VOD *</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://..."
                      dir="ltr"
                      className="text-left"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="link_thumbnail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>תמונת תצוגה (כתובת URL, אופציונלי)</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://.../image.jpg"
                      dir="ltr"
                      className="text-left"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <Label htmlFor="link_thumb_file">או העלאת תמונת תצוגה</Label>
              <input
                id="link_thumb_file"
                type="file"
                accept="image/*"
                className="text-sm"
                onChange={(e) =>
                  handleLinkThumbChange(e.target.files?.[0] ?? null)
                }
                aria-label="העלאת תמונה לתצוגה מקדימה"
              />
              {(linkThumbPreviewUrl ||
                (initialArticle?.media_type === "link" &&
                  initialArticle.link_thumbnail &&
                  !linkThumbFile)) && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground mb-2">
                    תצוגה מקדימה
                  </p>
                  <Image
                    src={
                      linkThumbPreviewUrl ??
                      initialArticle!.link_thumbnail!
                    }
                    alt=""
                    width={640}
                    height={360}
                    unoptimized
                    className="h-36 w-auto max-w-full rounded-md border object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="is_published"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormControl>
                <Switch
                  id="is_published"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel htmlFor="is_published" className="cursor-pointer">
                פורסם (מופיע בדף המידע)
              </FormLabel>
            </FormItem>
          )}
        />

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={pending}>
            {pending
              ? "שומר..."
              : isNew
                ? "הוסף תוכן"
                : "עדכן תוכן"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/articles" className="inline-flex items-center gap-2">
              <ArrowRight className="size-4" aria-hidden />
              חזרה לרשימה
            </Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}
