"use server";

import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { getAdminNotificationEmail } from "@/lib/admin";
import { contactSchema, categoryLabels, type ContactFormData, type SubmitContactResult } from "./constants";

export async function submitContactForm(
  data: ContactFormData
): Promise<SubmitContactResult> {
  const parsed = contactSchema.safeParse(data);
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const message =
      (first.name?.[0] ?? first.email?.[0] ?? first.category?.[0] ?? first.subject?.[0] ?? first.message?.[0]) ??
      "נא למלא את כל השדות הנדרשים.";
    return { success: false, error: message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("contact_submissions").insert({
    user_id: user?.id ?? null,
    name: parsed.data.name.trim(),
    email: parsed.data.email.trim().toLowerCase(),
    category: parsed.data.category,
    subject: parsed.data.subject.trim(),
    message: parsed.data.message.trim(),
    reference_id: parsed.data.reference_id?.trim() ?? null,
    reference_type: parsed.data.reference_type?.trim() ?? null,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  const adminTo = getAdminNotificationEmail();
  if (adminTo) {
    const label = categoryLabels[parsed.data.category] ?? parsed.data.category;
    await sendEmail({
      to: adminTo,
      replyTo: parsed.data.email,
      subject: `[Nipagesha] New Submission: ${parsed.data.category}`,
      html: [
        `<p><strong>קטגוריה:</strong> ${escapeHtml(label)}</p>`,
        `<p><strong>נושא:</strong> ${escapeHtml(parsed.data.subject)}</p>`,
        `<p><strong>מאת:</strong> ${escapeHtml(parsed.data.name)} &lt;${escapeHtml(parsed.data.email)}&gt;</p>`,
        parsed.data.reference_id
          ? `<p><strong>מזהה קישור:</strong> ${escapeHtml(parsed.data.reference_type ?? "")} – ${escapeHtml(parsed.data.reference_id)}</p>`
          : "",
        `<p><strong>הודעה:</strong></p><pre style="white-space:pre-wrap;font-family:inherit;">${escapeHtml(parsed.data.message)}</pre>`,
      ].join(""),
    });
  }

  return { success: true };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
