import { createClientForRouteHandler } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent("נא להזין אימייל וסיסמה")}`,
      { status: 302 }
    );
  }

  const { client: supabase, pendingCookies } = await createClientForRouteHandler(request);
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("[Auth] Login failed:", error.message);
    const message =
      error.message.includes("Invalid login credentials")
        ? "אימייל או סיסמה שגויים"
        : error.message;
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent(message)}`,
      { status: 302 }
    );
  }

  // Return 200 + Set-Cookie, then redirect via HTML. Many browsers do not persist
  // cookies set on a 302 response; returning 200 first fixes this (e.g. Safari, mobile).
  const dashboardUrl = `${requestUrl.origin}/dashboard`;
  const response = new NextResponse(
    `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${dashboardUrl}"></head><body>מתחבר... <a href="${dashboardUrl}">לחץ כאן אם לא הופנית</a></body></html>`,
    {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    }
  );
  pendingCookies.forEach(({ name, value, options }) =>
    response.cookies.set(name, value, (options ?? {}) as Record<string, unknown>)
  );
  console.log("[Auth] Login OK, cookies set:", pendingCookies.length, pendingCookies.map((c) => `${c.name}(size=${c.value.length})`).join(", "));
  return response;
}
