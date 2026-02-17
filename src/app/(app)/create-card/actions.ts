"use server";

import { createClient } from "@/lib/supabase/server";
import type { ChildCardInsert } from "@/lib/supabase/types";
import { redirect } from "next/navigation";

export type CreateCardResult = { error?: string };

/** Payload from client: child details + encrypted_message (never raw message or security answer). */
export type CreateChildCardPayload = Omit<ChildCardInsert, "user_id">;

export async function createChildCard(
  payload: CreateChildCardPayload
): Promise<CreateCardResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const row: ChildCardInsert = {
    user_id: user.id,
    child_first_name: payload.child_first_name.trim(),
    child_last_name: payload.child_last_name.trim(),
    birth_year: payload.birth_year,
    security_question: payload.security_question.trim(),
    encrypted_message: payload.encrypted_message,
  };

  const { error } = await supabase.from("child_cards").insert(row);

  if (error) {
    return { error: "שגיאה בשמירת הכרטיס. נסו שוב." };
  }

  redirect("/dashboard");
}
