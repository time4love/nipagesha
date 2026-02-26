"use server";

import { revalidatePath } from "next/cache";
import { adminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import type { ContactSubmissionRow } from "@/lib/supabase/types";

export async function getContactSubmissions(): Promise<ContactSubmissionRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) return [];

  const { data, error } = await adminClient
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getContactSubmissions error:", error.message);
    return [];
  }
  return (data ?? []) as ContactSubmissionRow[];
}

export interface SetSubmissionStatusResult {
  success: boolean;
  error?: string;
}

export async function setSubmissionStatusResolved(
  submissionId: string
): Promise<SetSubmissionStatusResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) {
    return { success: false, error: "לא מאושר" };
  }

  const { error } = await adminClient
    .from("contact_submissions")
    .update({ status: "resolved" })
    .eq("id", submissionId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/inbox");
  return { success: true };
}

export interface DeleteSubmissionResult {
  success: boolean;
  error?: string;
}

export async function deleteContactSubmission(
  submissionId: string
): Promise<DeleteSubmissionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) {
    return { success: false, error: "לא מאושר" };
  }

  const { error } = await adminClient
    .from("contact_submissions")
    .delete()
    .eq("id", submissionId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/inbox");
  return { success: true };
}
