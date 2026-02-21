import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/config";

/**
 * POST /auth/signout — sign out and clear auth cookies.
 * Used by the navbar "התנתק"; must run on the server so cookies are written to the response.
 */
export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url));

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, (options ?? {}) as Record<string, unknown>)
        );
      },
    },
  });

  await supabase.auth.signOut();
  return response;
}
