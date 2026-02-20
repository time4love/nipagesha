"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { HelpRequestRow } from "@/lib/supabase/types";
import { getRequesterDisplay } from "@/lib/help";

export interface HelpRequestWithRequester extends HelpRequestRow {
  requester_display_name?: string | null;
  requester_avatar_url?: string | null;
  requester_is_anonymous?: boolean;
}

export interface SubmitHelpOfferResult {
  success: boolean;
  error?: string;
}

export async function submitHelpOffer(formData: FormData): Promise<SubmitHelpOfferResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const requestId = formData.get("request_id") as string;
  const helperName = (formData.get("helper_name") as string)?.trim();
  const helperContact = (formData.get("helper_contact") as string)?.trim();
  const message = (formData.get("message") as string)?.trim() ?? "";

  if (!requestId || !helperName || !helperContact) {
    return { success: false, error: "נא למלא שם ואמצעי ליצירת קשר." };
  }

  const { error } = await supabase.from("help_offers").insert({
    request_id: requestId,
    helper_id: user?.id ?? null,
    helper_name: helperName,
    helper_contact: helperContact,
    message,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/help");
  revalidatePath("/dashboard/help");
  return { success: true };
}

export async function getHelpRequests(filters: {
  category?: string;
  location?: string;
}): Promise<HelpRequestWithRequester[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("help_requests")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (filters.category) {
    query = query.eq("category", filters.category);
  }
  if (filters.location) {
    query = query.ilike("location", `%${filters.location}%`);
  }

  const { data: requests, error } = await query;
  if (error) {
    console.error("getHelpRequests error:", error.message);
    return [];
  }

  const list = (requests ?? []) as HelpRequestRow[];
  if (list.length === 0) {
    return [];
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, is_anonymous, privacy_level")
    .in("id", list.map((r) => r.user_id));

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p])
  );

  return list.map((req) => {
    const profile = profileMap.get(req.user_id) ?? null;
    const { displayName, avatarUrl } = getRequesterDisplay(
      req,
      profile,
      !!user
    );
    return {
      ...req,
      requester_display_name: displayName,
      requester_avatar_url: avatarUrl,
      requester_is_anonymous: req.is_anonymous || !profile?.display_name,
    };
  });
}

export async function getCategories(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("help_requests")
    .select("category")
    .eq("status", "open");
  if (error) return [];
  const set = new Set((data ?? []).map((r) => r.category).filter(Boolean));
  return Array.from(set).sort();
}

export interface CreateHelpRequestResult {
  success: boolean;
  error?: string;
  id?: string;
}

export async function createHelpRequest(formData: FormData): Promise<CreateHelpRequestResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "יש להתחבר כדי לפרסם בקשה." };
  }

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() ?? "";
  const category = (formData.get("category") as string)?.trim();
  const location = (formData.get("location") as string)?.trim() ?? "";
  const isAnonymous = formData.get("is_anonymous") === "true";

  if (!title || !category) {
    return { success: false, error: "נא למלא כותרת וקטגוריה." };
  }

  const { data, error } = await supabase
    .from("help_requests")
    .insert({
      user_id: user.id,
      title,
      description,
      category,
      location,
      is_anonymous: isAnonymous,
      status: "open",
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/help");
  revalidatePath("/dashboard/help");
  return { success: true, id: data?.id };
}
