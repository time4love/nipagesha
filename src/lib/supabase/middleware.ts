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

  await supabase.auth.getUser();

  return response;
}
