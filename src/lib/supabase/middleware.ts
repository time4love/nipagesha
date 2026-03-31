import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Clears broken auth cookies when refresh is no longer valid on the server. */
function shouldClearStaleSession(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const { code, message } = error;
  if (
    code === "refresh_token_not_found" ||
    code === "refresh_token_already_used" ||
    code === "session_not_found"
  ) {
    return true;
  }
  return typeof message === "string" && message.includes("Invalid Refresh Token");
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
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          // עדכן בבקשה (כדי שהשרת יראה עכשיו)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );

          // צור מחדש תגובה כדי לסנכרן
          response = NextResponse.next({
            request,
          });

          // עדכן בתגובה (כדי שהדפדפן יראה אח"כ)
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, (options ?? {}) as Record<string, unknown>)
          );
        },
      },
    }
  );

  try {
    const { error } = await supabase.auth.getUser();
    if (shouldClearStaleSession(error)) {
      // Local only: no extra round-trip; sync cleared cookies via setAll above.
      await supabase.auth.signOut({ scope: "local" });
    }
  } catch {
    // Transient Edge fetch failure (offline, DNS, firewall). Do not fail the request.
  }

  return response;
}
