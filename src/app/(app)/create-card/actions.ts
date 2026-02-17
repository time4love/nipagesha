"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type CreateCardResult = { error?: string };

export async function createChildCard(
  payload: {
    child_first_name: string;
    child_last_name: string;
    birth_year: number;
    security_question: string;
    encrypted_message: string;
  }
): Promise<CreateCardResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.from("child_cards").insert({
    user_id: user.id,
    child_first_name: payload.child_first_name.trim(),
    child_last_name: payload.child_last_name.trim(),
    birth_year: payload.birth_year,
    security_question: payload.security_question.trim(),
    encrypted_message: payload.encrypted_message,
  });

  if (error) {
    console.error("createChildCard error:", error.message);
    return { error: "שגיאה בשמירת הכרטיס. נסו שוב." };
  }

  redirect("/dashboard");
}
