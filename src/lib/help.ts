import type { HelpRequestRow } from "@/lib/supabase/types";

const ANONYMOUS_LABEL = "הורה אנונימי";

/**
 * Resolve how to display the requester for a help request.
 * Returns display name (or anonymous label) and avatar URL for use in UI.
 */
export function getRequesterDisplay(
  request: HelpRequestRow,
  profile: {
    display_name: string;
    avatar_url: string | null;
    is_anonymous: boolean;
    privacy_level: string;
  } | null,
  viewerIsAuthenticated: boolean
): { displayName: string; avatarUrl: string | null } {
  if (request.is_anonymous) {
    return { displayName: ANONYMOUS_LABEL, avatarUrl: null };
  }
  if (!profile) {
    return { displayName: ANONYMOUS_LABEL, avatarUrl: null };
  }
  if (profile.is_anonymous) {
    return { displayName: ANONYMOUS_LABEL, avatarUrl: null };
  }
  const canShow =
    profile.privacy_level === "public" ||
    (profile.privacy_level === "registered_only" && viewerIsAuthenticated);
  if (!canShow) {
    return { displayName: ANONYMOUS_LABEL, avatarUrl: null };
  }
  const name = profile.display_name?.trim() || ANONYMOUS_LABEL;
  return { displayName: name, avatarUrl: profile.avatar_url };
}
