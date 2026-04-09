"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { normalizePersonName } from "@/lib/person-name";

export type SearchMatch = {
  id: string;
  security_question: string;
};

export type SearchResult =
  | { success: true; matches: SearchMatch[] }
  | { success: false; error: string };

const NOT_FOUND_MESSAGE = "לא נמצא כרטיס תואם לפרטים אלו";
const FILL_ALL_FIELDS_MESSAGE = "נא למלא את כל השדות.";

export async function searchChild(formData: FormData): Promise<SearchResult> {
  const firstName = (formData.get("firstName") as string | null)?.trim() ?? "";
  const birthDate = (formData.get("birthDate") as string | null)?.trim() ?? "";

  if (!firstName || !birthDate) {
    return { success: false, error: FILL_ALL_FIELDS_MESSAGE };
  }

  // Expect YYYY-MM-DD; validate format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    return { success: false, error: FILL_ALL_FIELDS_MESSAGE };
  }

  const nameKey = normalizePersonName(firstName);
  if (!nameKey) {
    return { success: false, error: FILL_ALL_FIELDS_MESSAGE };
  }

  const supabase = createAdminClient();
  // Match by birth date first (indexed), then compare normalized names in memory.
  // Avoids ILIKE edge cases with Hebrew/Unicode and gives stable Latin case matching.
  const { data, error } = await supabase
    .from("child_cards")
    .select("id, security_question, child_first_name")
    .eq("birth_date", birthDate)
    .order("created_at", { ascending: true });

  if (error) {
    return { success: false, error: NOT_FOUND_MESSAGE };
  }

  const rows = (data ?? []).filter(
    (row) => normalizePersonName(row.child_first_name) === nameKey
  );

  const matches: SearchMatch[] = rows.map((row) => ({
    id: row.id,
    security_question: row.security_question,
  }));

  if (matches.length === 0) {
    return { success: false, error: NOT_FOUND_MESSAGE };
  }

  return { success: true, matches };
}
