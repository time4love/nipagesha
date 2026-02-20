import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/middleware";

// Run on /admin only to refresh the session and return updated cookies in the response.
// We do NOT redirect here: Edge can fail to read the session (getUser() returns null) and would
// wrongly send admins to login. Redirect is done in src/app/admin/layout.tsx via requireAdmin().
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const { supabase, response } = await createClient(request);
  await supabase.auth.getUser(); // may refresh session; setAll writes cookies onto response
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
