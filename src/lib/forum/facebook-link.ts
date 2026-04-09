import { z } from "zod";

const FACEBOOK_LINK_ERROR_INVALID = "נא להזין כתובת URL תקינה.";
const FACEBOOK_LINK_ERROR_NOT_FB = "נא להזין קישור לפוסט בפייסבוק (facebook.com).";

function isFacebookHostname(host: string): boolean {
  const h = host.toLowerCase();
  return (
    h === "fb.watch" ||
    h.endsWith(".facebook.com") ||
    h === "facebook.com" ||
    h.endsWith(".fb.com") ||
    h === "fb.com"
  );
}

/**
 * Validates optional Facebook post URL for storage. Empty string → null.
 */
export function parseOptionalFacebookLink(
  raw: string | undefined | null
):
  | { ok: true; value: string | null }
  | { ok: false; error: string } {
  const t = (raw ?? "").trim();
  if (!t) {
    return { ok: true, value: null };
  }
  let u: URL;
  try {
    u = new URL(t);
  } catch {
    return { ok: false, error: FACEBOOK_LINK_ERROR_INVALID };
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    return { ok: false, error: FACEBOOK_LINK_ERROR_INVALID };
  }
  if (!isFacebookHostname(u.hostname)) {
    return { ok: false, error: FACEBOOK_LINK_ERROR_NOT_FB };
  }
  return { ok: true, value: u.href };
}

/** Zod field for forms: optional string → null or canonical Facebook post URL. */
export const forumPostFacebookLinkFieldSchema = z
  .string()
  .transform((s) => (s ?? "").trim())
  .superRefine((val, ctx) => {
    if (!val) return;
    const r = parseOptionalFacebookLink(val);
    if (!r.ok) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: r.error });
    }
  })
  .transform((val): string | null => {
    const r = parseOptionalFacebookLink(val);
    return r.ok ? r.value : null;
  });
