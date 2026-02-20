"use server";

import { revalidatePath } from "next/cache";
import { adminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import type { HelpRequestRow } from "@/lib/supabase/types";

export interface PendingHelpRequest extends HelpRequestRow {
  requester_display_name?: string | null;
}

export async function getPendingHelpRequests(): Promise<PendingHelpRequest[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) return [];

  const { data, error } = await adminClient
    .from("help_requests")
    .select("id, user_id, title, description, category, location, status, is_anonymous, created_at, updated_at, rejection_reason")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getPendingHelpRequests error:", error.message);
    return [];
  }

  const list = (data ?? []) as HelpRequestRow[];
  if (list.length === 0) return [];

  const { data: profiles } = await adminClient
    .from("profiles")
    .select("id, display_name")
    .in("id", list.map((r) => r.user_id));

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p])
  );

  return list.map((req) => ({
    ...req,
    requester_display_name: profileMap.get(req.user_id)?.display_name ?? null,
  }));
}

export interface SetHelpRequestStatusResult {
  success: boolean;
  error?: string;
}

export async function setHelpRequestStatus(
  requestId: string,
  status: "approved" | "rejected",
  rejectionReason?: string
): Promise<SetHelpRequestStatusResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) {
    return { success: false, error: "לא מאושר" };
  }

  if (status === "rejected") {
    const reason = rejectionReason?.trim();
    if (!reason) {
      return { success: false, error: "נא לכתוב סיבת דחייה קצרה להורה." };
    }
  }

  const updatePayload: { status: "approved" | "rejected"; rejection_reason?: string | null } = {
    status,
  };
  if (status === "rejected") {
    updatePayload.rejection_reason = rejectionReason?.trim() ?? null;
  } else {
    updatePayload.rejection_reason = null;
  }

  const { error } = await adminClient
    .from("help_requests")
    .update(updatePayload)
    .eq("id", requestId)
    .eq("status", "pending");

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/help-requests");
  revalidatePath("/help");
  revalidatePath("/dashboard/help");
  return { success: true };
}
