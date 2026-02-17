/**
 * Supabase browser client for client-side usage (Auth, realtime, etc.).
 * Server-side code should use server.ts or createServerClient.
 */

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/config";

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
