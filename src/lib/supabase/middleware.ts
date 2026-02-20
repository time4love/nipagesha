/**
 * Supabase session refresh for Next.js Middleware (Edge).
 * Matches official pattern: https://github.com/supabase/supabase/blob/master/examples/auth/nextjs/lib/supabase/proxy.ts
 *
 * Critical: use getClaims() (not getUser()) and update both request and response cookies,
 * or "your users may be randomly logged out" (Supabase docs).
 */

import type { CookieOptions } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function mergeProductionCookieOptions(
  request: NextRequest,
  options: CookieOptions | undefined
): CookieOptions {
  const isHttps = request.nextUrl.protocol === "https:";
  return {
    path: "/",
    sameSite: "lax",
    ...options,
    ...(isHttps && { secure: true }),
  };
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          // 1) Update REQUEST so Server Components see refreshed cookies in this same request
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          // 2) New response carrying the same (now updated) request
          supabaseResponse = NextResponse.next({ request });
          // 3) Write cookies to RESPONSE so the browser receives them
          cookiesToSet.forEach(({ name, value, options }) => {
            const merged = mergeProductionCookieOptions(request, options);
            supabaseResponse.cookies.set(name, value, merged as Record<string, unknown>);
          });
        },
      },
    }
  );

  // Do not run code between createServerClient and getClaims() – avoids random logouts (Supabase docs).
  await supabase.auth.getClaims();

  return supabaseResponse;
}
