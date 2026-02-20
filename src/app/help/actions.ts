"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { HelpRequestRow } from "@/lib/supabase/types";
import { getRequesterDisplay } from "@/lib/help";
import { HELP_CATEGORIES } from "@/lib/constants";
import { REGIONS, CITY_TO_REGION_MAP } from "@/lib/israel-cities";
import { sendEmail } from "@/lib/email";

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

  // Notify request owner by email (best-effort; do not fail the action)
  try {
    const { adminClient } = await import("@/lib/supabase/admin");
    const { data: request } = await adminClient
      .from("help_requests")
      .select("user_id, title")
      .eq("id", requestId)
      .single();
    if (request?.user_id) {
      const {
        data: { user: owner },
      } = await adminClient.auth.admin.getUserById(request.user_id);
      const to = owner?.email;
      if (to) {
        await sendEmail({
          to,
          subject: "התקבלה הצעת עזרה בבקשה שלכם – לוח עזרה",
          html: `<p>שלום,</p><p>מישהו/י הגיב/ה לבקשת העזרה &quot;${escapeHtml(request.title ?? "")}&quot; ורוצה לעזור.</p><p>כניסה ל<strong>הבקשות שלי</strong> באתר תאפשר לראות את פרטי ההתקשרות.</p><p>בברכה,<br/>לוח עזרה ניפגשה</p>`,
        });
      }
    }
  } catch {
    // Ignore: missing service role key, Resend not configured, or auth/admin errors
  }

  revalidatePath("/help");
  revalidatePath("/dashboard/help");
  return { success: true };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export interface GetHelpRequestsResult {
  data: HelpRequestWithRequester[];
  hasMore: boolean;
}

export async function getHelpRequests(
  filters: { category?: string; location?: string },
  offset: number = 0,
  limit: number = 10
): Promise<GetHelpRequestsResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("help_requests")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (filters.category) {
    query = query.eq("category", filters.category);
  }
  if (filters.location && filters.location !== "כל הארץ") {
    const isRegion = (REGIONS as readonly string[]).includes(filters.location);
    if (isRegion) {
      const citiesInRegion = Object.entries(CITY_TO_REGION_MAP)
        .filter(([, region]) => region === filters.location)
        .map(([city]) => city);
      query = query.in("location", [filters.location, ...citiesInRegion]);
    } else {
      query = query.eq("location", filters.location);
    }
  }

  const { data: requests, error } = await query.range(
    offset,
    offset + limit - 1
  );
  if (error) {
    console.error("getHelpRequests error:", error.message);
    return { data: [], hasMore: false };
  }

  const list = (requests ?? []) as HelpRequestRow[];
  if (list.length === 0) {
    return { data: [], hasMore: false };
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, is_anonymous, privacy_level")
    .in("id", list.map((r) => r.user_id));

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p])
  );

  const data = list.map((req) => {
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

  return { data, hasMore: list.length === limit };
}

/** Categories for filter/form (from constant). */
export async function getCategories(): Promise<string[]> {
  return [...HELP_CATEGORIES];
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
  if (!HELP_CATEGORIES.includes(category as (typeof HELP_CATEGORIES)[number])) {
    return { success: false, error: "נא לבחור קטגוריה מהרשימה." };
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
      status: "pending",
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
