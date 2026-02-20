/**
 * Supabase server client for Server Components and Route Handlers.
 * Uses cookies for session.
 */

import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } from "@/lib/config";

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Components cannot write cookies; middleware does the actual writing.
        }
      },
    },
  });
}

/**
 * Admin client (service role). Use only for server-side, unauthenticated flows:
 * child search and message-by-id. Never expose to the client.
 */
export function createAdminClient() {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for admin operations");
  }
  return createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}
