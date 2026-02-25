"use server";

import { createClient } from "@/lib/supabase/server";
import type { ChildCardInsert } from "@/lib/supabase/types";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type CreateCardResult = { error?: string };
export type UpdateCardResult = { error?: string };

/** Payload from client: child details + encrypted_message (never raw message or security answer). */
export type CreateChildCardPayload = Omit<ChildCardInsert, "user_id">;

/** Payload for updating an existing card (encrypted_message is re-encrypted on client). */
export type UpdateChildCardPayload = {
  child_first_name: string;
  birth_date: string; // ISO date YYYY-MM-DD
  security_question: string;
  encrypted_message: string;
};

/** Card data needed for the edit page (owner-only). */
export type EditCardData = {
  id: string;
  child_first_name: string;
  birth_date: string; // ISO date YYYY-MM-DD
  security_question: string;
  encrypted_message: string;
};

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
    birth_date: payload.birth_date,
    security_question: payload.security_question.trim(),
    encrypted_message: payload.encrypted_message,
  };

  const { error } = await supabase.from("child_cards").insert(row);

  if (error) {
    return { error: "שגיאה בשמירת הכרטיס. נסו שוב." };
  }

  redirect("/dashboard");
}

/** Fetches card by id; returns null if not found or not owned by current user. */
export async function getCardForEdit(cardId: string): Promise<EditCardData | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("child_cards")
    .select("id, child_first_name, birth_date, security_question, encrypted_message")
    .eq("id", cardId)
    .eq("user_id", user.id)
    .single();

  if (error || !data) return null;
  return {
    id: data.id,
    child_first_name: data.child_first_name,
    birth_date: data.birth_date,
    security_question: data.security_question,
    encrypted_message: data.encrypted_message,
  };
}

/** Updates a child card. Validates that auth.uid() matches the card owner. */
export async function updateChildCard(
  cardId: string,
  payload: UpdateChildCardPayload
): Promise<UpdateCardResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "יש להתחבר כדי לערוך כרטיס." };
  }

  const { data: existing } = await supabase
    .from("child_cards")
    .select("id")
    .eq("id", cardId)
    .eq("user_id", user.id)
    .single();

  if (!existing) {
    return { error: "הכרטיס לא נמצא או שאין הרשאה לערוך אותו." };
  }

  const { data: updated, error } = await supabase
    .from("child_cards")
    .update({
      child_first_name: payload.child_first_name.trim(),
      birth_date: payload.birth_date,
      security_question: payload.security_question.trim(),
      encrypted_message: payload.encrypted_message,
      updated_at: new Date().toISOString(),
    })
    .eq("id", cardId)
    .eq("user_id", user.id)
    .select("id")
    .single();

  if (error || !updated) {
    return { error: "שגיאה בעדכון הכרטיס. נסו שוב." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/edit-card/${cardId}`);

  return {};
}
