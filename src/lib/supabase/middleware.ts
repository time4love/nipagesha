/**
 * Supabase client for Next.js Middleware (Edge).
 * Ensures refreshed session cookies are written back with production-safe options
 * so the browser sends them on subsequent requests (Vercel, HTTPS).
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
    // Required in production: browser only sends cookie over HTTPS when secure is true
    ...(isHttps && { secure: true }),
  };
}

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
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            const merged = mergeProductionCookieOptions(request, options);
            response.cookies.set(name, value, merged as Record<string, unknown>);
          });
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}
