"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { uploadPublicFile } from "@/lib/supabase/public-storage";
import type { SupabaseClient } from "@supabase/supabase-js";
import { adminClient } from "@/lib/supabase/admin";
import type { ParentRole, PrivacyLevel, ProfileRow } from "@/lib/supabase/types";

const BUCKET_SECURE_MEDIA = "secure-media";
const BUCKET_PUBLIC_MEDIA = "public-media";
const REMOVE_BATCH_SIZE = 1000;

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

export interface DeleteAccountResult {
  success: boolean;
  error?: string;
}

/**
 * Permanently deletes the current user's account and all related data (GDPR / Right to be forgotten).
 * Uses service role to delete from Auth and Storage; DB rows are removed by ON DELETE CASCADE.
 * Caller must sign out and redirect after success.
 */
export async function deleteAccount(): Promise<DeleteAccountResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const userId = user.id;
  const admin = adminClient;

  try {
    // 1. Storage: remove all files under user folder in both buckets (recursive list then batch remove)
    for (const bucket of [BUCKET_SECURE_MEDIA, BUCKET_PUBLIC_MEDIA] as const) {
      let paths: string[];
      try {
        paths = await listAllPathsInPrefix(admin, bucket, userId);
      } catch (listErr) {
        const msg = listErr instanceof Error ? listErr.message : String(listErr);
        if (msg.includes("not found") || msg.includes("Bucket")) continue;
        return { success: false, error: msg };
      }
      for (let i = 0; i < paths.length; i += REMOVE_BATCH_SIZE) {
        const batch = paths.slice(i, i + REMOVE_BATCH_SIZE);
        const { error: removeError } = await admin.storage.from(bucket).remove(batch);
        if (removeError) return { success: false, error: removeError.message };
      }
    }

    // 2. Auth: delete user (CASCADE in DB will remove profiles, child_cards, help_requests, etc.)
    const { error: deleteUserError } = await admin.auth.admin.deleteUser(userId);
    if (deleteUserError) {
      return { success: false, error: deleteUserError.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

/** Lists all file paths under a prefix (folder); recurses into subfolders. */
async function listAllPathsInPrefix(
  admin: SupabaseClient,
  bucket: string,
  prefix: string
): Promise<string[]> {
  const paths: string[] = [];
  const stack: string[] = [prefix];

  while (stack.length > 0) {
    const current = stack.pop()!;
    const { data: items, error } = await admin.storage.from(bucket).list(current, { limit: 1000 });
    if (error) {
      if (error.message?.includes("not found") || error.message?.includes("Bucket")) continue;
      throw error;
    }
    for (const item of items ?? []) {
      if (!item.name) continue;
      const fullPath = current ? `${current}/${item.name}` : item.name;
      const isFile = "id" in item && item.id != null;
      if (isFile) {
        paths.push(fullPath);
      } else {
        stack.push(fullPath);
      }
    }
  }
  return paths;
}
