/** Shared with client; do not add "use server". */

import { z } from "zod";

export const contactCategories = [
  "general",
  "support",
  "bug",
  "report_abuse",
  "report_content",
] as const;

export const categoryLabels: Record<(typeof contactCategories)[number], string> = {
  general: "כללי",
  support: "תמיכה",
  bug: "דיווח על תקלה",
  report_abuse: "דיווח על שימוש לרעה",
  report_content: "דיווח על תוכן",
};

export const contactSchema = z.object({
  name: z.string().min(1, "נא להזין שם"),
  email: z.string().email("נא להזין כתובת אימייל תקינה"),
  category: z.enum(contactCategories),
  subject: z.string().min(1, "נא להזין נושא"),
  message: z.string().min(1, "נא להזין הודעה"),
  reference_id: z.string().optional(),
  reference_type: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export interface SubmitContactResult {
  success: boolean;
  error?: string;
}
