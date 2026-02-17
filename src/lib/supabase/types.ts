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
