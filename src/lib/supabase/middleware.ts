/**
 * Supabase client for Next.js Middleware (Edge).
 * Official Supabase SSR pattern: ensures refreshed session cookies are written
 * back to the browser so production (e.g. Vercel) keeps the user logged in.
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          // Recreate response so the browser receives updated cookies (critical for production)
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as Record<string, unknown>)
          );
        },
      },
    }
  );

  // Validates the session and refreshes the token if needed; setAll above runs when cookies change
  await supabase.auth.getUser();

  return response;
}
