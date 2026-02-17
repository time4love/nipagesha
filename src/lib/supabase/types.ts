/**
 * Types for child_cards table.
 * Create the table in Supabase with RLS: user can only access their own rows.
 */

export interface ChildCardRow {
  id: string;
  user_id: string;
  child_first_name: string;
  child_last_name: string;
  birth_year: number;
  security_question: string;
  encrypted_message: string;
  created_at: string;
}

export interface ChildCardInsert {
  user_id: string;
  child_first_name: string;
  child_last_name: string;
  birth_year: number;
  security_question: string;
  encrypted_message: string;
}

/** Subset of child_cards used for the public message unlock page (no auth). */
export interface MessagePageCard {
  id: string;
  child_first_name: string;
  child_last_name: string;
  security_question: string;
  encrypted_message: string;
}
