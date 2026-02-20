"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { uploadPublicFile } from "@/lib/supabase/public-storage";
import type { ParentRole, PrivacyLevel, ProfileRow } from "@/lib/supabase/types";

export interface UpdateProfileResult {
  success: boolean;
  error?: string;
}

export async function updateProfile(formData: FormData): Promise<UpdateProfileResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const displayName = (formData.get("display_name") as string)?.trim() ?? "";
  const isAnonymous = formData.get("is_anonymous") === "true";
  const privacyLevel = (formData.get("privacy_level") as PrivacyLevel) ?? "registered_only";
  const parentRoleRaw = formData.get("parent_role") as string | null;
  const parentRole: ParentRole | null =
    parentRoleRaw === "dad" || parentRoleRaw === "mom" ? parentRoleRaw : null;
  const avatarFile = formData.get("avatar") as File | null;

  let avatarUrl: string | null = null;

  if (avatarFile?.size && avatarFile.size > 0) {
    const { url, error } = await uploadPublicFile(avatarFile, "avatars");
    if (error) {
      return { success: false, error };
    }
    avatarUrl = url ?? null;
  }

  const update: Partial<ProfileRow> = {
    display_name: displayName || "",
    is_anonymous: isAnonymous,
    privacy_level: privacyLevel,
    parent_role: parentRole,
  };
  if (avatarUrl !== null) {
    update.avatar_url = avatarUrl;
  }

  const { error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/profile");
  revalidatePath("/help");
  revalidatePath("/dashboard/help");
  return { success: true };
}

export async function getProfile(userId: string): Promise<ProfileRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error || !data) return null;
  return data as ProfileRow;
}
