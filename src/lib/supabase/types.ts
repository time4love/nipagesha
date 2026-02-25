/**
 * Types for child_cards table.
 * Create the table in Supabase with RLS: user can only access their own rows.
 */

export interface ChildCardRow {
  id: string;
  user_id: string;
  child_first_name: string;
  birth_date: string; // ISO date YYYY-MM-DD
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
  birth_date: string; // ISO date YYYY-MM-DD
  security_question: string;
  encrypted_message: string;
}

/** Subset of child_cards used for the public message unlock page (no auth). */
export interface MessagePageCard {
  id: string;
  child_first_name: string;
  security_question: string;
  encrypted_message: string;
}

/** One row from child_replies (child's message back to parent). */
export interface ChildReplyRow {
  id: string;
  card_id: string;
  parent_id: string;
  content: string;
  contact_info: string | null;
  created_at: string;
  is_read: boolean;
}

/** Profile row (1:1 with auth.users). */
export type PrivacyLevel = "public" | "registered_only";

/** Parent role shown to child on message/reply (ניכור הורי). */
export type ParentRole = "dad" | "mom";

export interface ProfileRow {
  id: string;
  display_name: string;
  avatar_url: string | null;
  is_anonymous: boolean;
  privacy_level: PrivacyLevel;
  parent_role: ParentRole | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdate {
  display_name?: string;
  avatar_url?: string | null;
  is_anonymous?: boolean;
  privacy_level?: PrivacyLevel;
  parent_role?: ParentRole | null;
}

/** Help request status (moderation: pending → approved/rejected; owner can close). */
export type HelpRequestStatus = "pending" | "approved" | "rejected" | "closed";

/** One row from help_requests. */
export interface HelpRequestRow {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  status: HelpRequestStatus;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
  /** Set by moderator when status is rejected; shown to the parent. */
  rejection_reason?: string | null;
}

/** One row from help_offers. */
export interface HelpOfferRow {
  id: string;
  request_id: string;
  helper_id: string | null;
  helper_name: string;
  helper_contact: string;
  message: string;
  created_at: string;
  /** False until the request owner views the offers list. */
  seen_by_owner?: boolean;
}

/** Contact form / report submission category. */
export type ContactCategory =
  | "general"
  | "support"
  | "bug"
  | "report_abuse"
  | "report_content";

/** Contact submission status (admin workflow). */
export type ContactStatus = "open" | "in_progress" | "resolved";

/** One row from contact_submissions. */
export interface ContactSubmissionRow {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  category: ContactCategory;
  subject: string;
  message: string;
  reference_id: string | null;
  reference_type: string | null;
  status: ContactStatus;
  created_at: string;
}
