"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { HelpRequestRow, HelpOfferRow } from "@/lib/supabase/types";
import { HELP_CATEGORIES } from "@/lib/constants";

export async function getMyHelpRequests(): Promise<HelpRequestRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("help_requests")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getMyHelpRequests error:", error.message);
    return [];
  }
  return (data ?? []) as HelpRequestRow[];
}

export async function getOffersForRequest(requestId: string): Promise<HelpOfferRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: request } = await supabase
    .from("help_requests")
    .select("user_id")
    .eq("id", requestId)
    .single();
  if (!request || request.user_id !== user.id) {
    return [];
  }

  const { data, error } = await supabase
    .from("help_offers")
    .select("*")
    .eq("request_id", requestId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as HelpOfferRow[];
}

export interface UpdateStatusResult {
  success: boolean;
  error?: string;
}

export async function updateRequestStatus(
  requestId: string,
  status: "closed"
): Promise<UpdateStatusResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "לא מאומת" };

  const { error } = await supabase
    .from("help_requests")
    .update({ status })
    .eq("id", requestId)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/help");
  revalidatePath("/help");
  return { success: true };
}

export interface UpdateHelpRequestResult {
  success: boolean;
  error?: string;
}

export async function updateHelpRequest(
  requestId: string,
  formData: FormData
): Promise<UpdateHelpRequestResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "לא מאומת" };

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() ?? "";
  const category = (formData.get("category") as string)?.trim();
  const location = (formData.get("location") as string)?.trim() ?? "";
  const isAnonymous = formData.get("is_anonymous") === "true";

  if (!title || !category) {
    return { success: false, error: "נא למלא כותרת וקטגוריה." };
  }
  if (!HELP_CATEGORIES.includes(category as (typeof HELP_CATEGORIES)[number])) {
    return { success: false, error: "נא לבחור קטגוריה מהרשימה." };
  }

  const { data, error } = await supabase
    .from("help_requests")
    .update({
      title,
      description,
      category,
      location,
      is_anonymous: isAnonymous,
    })
    .eq("id", requestId)
    .eq("user_id", user.id)
    .eq("status", "pending")
    .select("id")
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return { success: false, error: "לא ניתן לערוך בקשה לאחר שאושרה." };
    }
    return { success: false, error: error.message };
  }
  revalidatePath("/dashboard/help");
  revalidatePath("/help");
  return { success: true };
}

export interface DeleteRequestResult {
  success: boolean;
  error?: string;
}

export async function deleteHelpRequest(requestId: string): Promise<DeleteRequestResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "לא מאומת" };

  const { error } = await supabase
    .from("help_requests")
    .delete()
    .eq("id", requestId)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/help");
  revalidatePath("/help");
  return { success: true };
}
