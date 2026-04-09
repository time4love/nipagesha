import { z } from "zod";
import { hasHtmlContent } from "@/lib/child-card";
import { parseOptionalFacebookLink } from "@/lib/forum/facebook-link";

export const TITLE_MIN_MESSAGE = "נא למלא כותרת (לפחות 3 תווים).";
export const CONTENT_OR_FACEBOOK_MESSAGE = "נא להוסיף תוכן או קישור לפייסבוק.";

/**
 * Forum post editor: title required (≥3 chars); content optional if a valid Facebook link is set.
 * At least one of meaningful HTML content or Facebook URL is required.
 */
export const forumPostEditorSchema = z
  .object({
    title: z.string().trim().min(3, TITLE_MIN_MESSAGE),
    content: z.string().default(""),
    facebook_link: z.string().default(""),
  })
  .superRefine((data, ctx) => {
    const fbResult = parseOptionalFacebookLink(data.facebook_link);
    if (!fbResult.ok) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: fbResult.error,
        path: ["facebook_link"],
      });
      return;
    }
    const hasText = hasHtmlContent(data.content);
    const hasFb = fbResult.value !== null;
    if (!hasText && !hasFb) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: CONTENT_OR_FACEBOOK_MESSAGE,
        path: ["content"],
      });
    }
  });

export type ForumPostEditorFormValues = z.infer<typeof forumPostEditorSchema>;

/** True when there is nothing meaningful to show in the live preview. */
export function isForumPreviewEmpty(
  title: string,
  content: string,
  facebookRaw: string
): boolean {
  if ((title ?? "").trim().length > 0) return false;
  if (hasHtmlContent(content ?? "")) return false;
  const fb = parseOptionalFacebookLink(facebookRaw);
  return !(fb.ok && fb.value !== null);
}
