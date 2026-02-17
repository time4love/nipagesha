"use server";

import { createClient } from "@/lib/supabase/server";
import { getSignedUrl as getSignedUrlFromStorage } from "@/lib/supabase/storage";
import { redirect } from "next/navigation";

export async function getSignedUrl(path: string): Promise<{ url?: string; error?: string }> {
  return getSignedUrlFromStorage(path);
}

export type CardForReveal = {
  security_question: string;
  encrypted_message: string;
  child_first_name: string;
  child_last_name: string;
};

export async function getCardForReveal(cardId: string): Promise<CardForReveal | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("child_cards")
    .select("security_question, encrypted_message, child_first_name, child_last_name")
    .eq("id", cardId)
    .eq("user_id", user.id)
    .single();

  if (error || !data) return null;
  return {
    security_question: data.security_question,
    encrypted_message: data.encrypted_message,
    child_first_name: data.child_first_name,
    child_last_name: data.child_last_name,
  };
}
