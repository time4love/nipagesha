import { createClientForRouteHandler } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * GET /api/auth/signout — signs out and redirects to home.
 * Uses Route Handler so cookie updates are applied to the redirect response
 * (fixes sign-out not clearing session when done via Server Action).
 */
export async function GET(request: Request) {
  const { client: supabase, pendingCookies } = await createClientForRouteHandler(request);
  await supabase.auth.signOut();

  const redirectUrl = new URL("/", request.url);
  const response = NextResponse.redirect(redirectUrl, 302);
  pendingCookies.forEach(({ name, value, options }) =>
    response.cookies.set(name, value, options as Record<string, unknown>)
  );
  return response;
}
