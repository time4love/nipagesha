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
  is_read: boolean;
  created_at: string;
  updated_at?: string;
}

/** One row from card_access_logs (for dashboard activity). */
export interface CardAccessLogRow {
  id: string;
  card_id: string;
  attempt_type: "success" | "failure";
  anonymized_ip: string;
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
