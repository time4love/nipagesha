"use server";

import { createClient } from "@/lib/supabase/server";

export interface DeleteChildCardResult {
  success: boolean;
  error?: string;
}

/**
 * Deletes a child card. RLS ensures only the card owner (auth.uid() = user_id) can delete.
 * Child replies and card_access_logs are removed by ON DELETE CASCADE.
 */
export async function deleteChildCard(cardId: string): Promise<DeleteChildCardResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("child_cards").delete().eq("id", cardId);
  if (error) {
    console.error("deleteChildCard error:", error.message);
    return { success: false, error: error.message };
  }
  return { success: true };
}
